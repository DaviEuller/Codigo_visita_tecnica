import { nanoid } from 'nanoid';
import { getRoom, updateRoom } from '../store/roomsStore.js';
import { newParticipant } from '../game/Room.js';
import { applyCorrectAnswer, applyWrongAnswer } from '../game/scoring.js';
import { buildLeaderboard } from './adminHandlers.js';

function normalize(code) {
  return code.replace(/\s+/g, ' ').trim();
}

export function registerPlayerHandlers(io, socket) {
  socket.on('player:join', ({ roomCode, name }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit('player:joinError', { message: 'Sala não encontrada' });
    if (room.status !== 'waiting') return socket.emit('player:joinError', { message: 'Jogo já iniciado' });
    if (room.maxParticipants && room.participants.length >= room.maxParticipants) {
      return socket.emit('player:joinError', { message: 'Sala cheia' });
    }

    const participant = newParticipant({ id: nanoid(8), socketId: socket.id, name });
    room.participants.push(participant);
    updateRoom(room.code, room);

    socket.join(`room:${room.code}`);
    socket.data.participantId = participant.id;
    socket.data.roomCode = room.code;

    socket.emit('player:joined', { participantId: participant.id, roomCode: room.code });
    io.to(`admin:${room.code}`).emit('room:participantJoined', { participant });
  });

  socket.on('player:submitCode', ({ code }) => {
    const roomCode = socket.data.roomCode;
    const participantId = socket.data.participantId;
    const room = getRoom(roomCode);
    if (!room || room.status !== 'running') return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant || participant.status !== 'solving') return;

    const isCorrect = normalize(code) === normalize(room.expectedFix);

    if (isCorrect) {
      const rank = room.finishOrder.length + 1;
      room.finishOrder.push(participantId);

      const elapsedSeconds = (Date.now() - (participant.startedAt || Date.now())) / 1000;
      const timeLeftSeconds = Math.max(0, room.timeLimit - elapsedSeconds);
      const { bonus, totalGained } = applyCorrectAnswer(participant, timeLeftSeconds, room.timeLimit);

      updateRoom(room.code, room);

      socket.emit('submit:correct', { rank, bonus, newScore: participant.score, totalGained });
      io.to(`admin:${room.code}`).emit('game:participantSolved', {
        participantId,
        rank,
        scoreGained: totalGained,
      });

      checkGameEnd(io, room);
    } else {
      const { penalty } = applyWrongAnswer(participant);
      updateRoom(room.code, room);

      socket.emit('submit:wrong', {
        message: 'Ainda tem erro no código. Reveja a lógica.',
        penalty,
        newScore: participant.score,
      });
      io.to(`admin:${room.code}`).emit('game:participantUpdate', {
        participantId,
        status: participant.status,
        score: participant.score,
        attempts: participant.attempts,
        timeLeft: participant.timeLeft,
      });
    }
  });

  socket.on('player:timeUp', () => {
    const roomCode = socket.data.roomCode;
    const participantId = socket.data.participantId;
    const room = getRoom(roomCode);
    if (!room) return;

    const participant = room.participants.find((p) => p.id === participantId);
    if (!participant || participant.status !== 'solving') return;

    participant.status = 'failed_time';
    updateRoom(room.code, room);

    socket.emit('game:timeUp', { finalScore: participant.score });
    io.to(`admin:${room.code}`).emit('game:participantUpdate', {
      participantId,
      status: participant.status,
      score: participant.score,
    });

    checkGameEnd(io, room);
  });
}

function checkGameEnd(io, room) {
  const allDone = room.participants.every((p) => p.status === 'correct' || p.status === 'failed_time');
  if (!allDone) return;

  room.status = 'finished';
  const leaderboard = buildLeaderboard(room);

  io.to(`admin:${room.code}`).emit('game:finished', { leaderboard });
  io.to(`room:${room.code}`).emit('game:finished', { leaderboard });
}
