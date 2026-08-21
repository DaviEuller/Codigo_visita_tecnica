import { getRoom, updateRoom } from '../store/roomsStore.js';
import { splitCodeIntoParts } from '../game/splitCode.js';
import { injectRandomBug } from '../game/injectBugs.js';

export function registerAdminHandlers(io, socket) {
  socket.on('admin:joinRoom', ({ roomCode, adminToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.adminToken !== adminToken) {
      socket.emit('admin:joinError', { message: 'Sala ou token inválido' });
      return;
    }

    socket.join(`admin:${room.code}`);
    updateRoom(room.code, { adminSocketId: socket.id });
    socket.emit('admin:joined', { room: sanitizeRoom(room) });
  });

  socket.on('admin:startGame', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.status !== 'waiting') return;
    if (room.participants.length === 0) return;

    const n = room.participants.length;
    const parts = splitCodeIntoParts(room.sourceCode, n);

    room.parts = parts.map((original, index) => {
      const { buggyCode, expectedFix, mutation } = injectRandomBug(original);
      return { index, originalCode: original, buggyCode, expectedFix, mutation, assignedTo: null };
    });

    room.participants.forEach((participant, i) => {
      participant.partIndex = i;
      participant.status = 'solving';
      participant.timeLeft = room.timeLimit;
      room.parts[i].assignedTo = participant.id;

      io.to(participant.socketId).emit('game:yourPart', {
        partIndex: i,
        buggyCode: room.parts[i].buggyCode,
        language: room.language,
        timeLimit: room.timeLimit,
      });
    });

    room.status = 'running';
    updateRoom(room.code, room);

    io.to(`admin:${room.code}`).emit('game:started', { room: sanitizeRoom(room) });
  });

  socket.on('admin:endGame', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    room.status = 'finished';
    updateRoom(room.code, room);

    const leaderboard = buildLeaderboard(room);
    io.to(`admin:${room.code}`).emit('game:finished', { leaderboard });
    io.to(`room:${room.code}`).emit('game:finished', { leaderboard });
  });

  socket.on('admin:kickParticipant', ({ roomCode, participantId }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    const target = room.participants.find((p) => p.id === participantId);
    if (!target) return;

    io.to(target.socketId).emit('player:kicked');
    room.participants = room.participants.filter((p) => p.id !== participantId);
    updateRoom(room.code, room);

    io.to(`admin:${room.code}`).emit('room:participantLeft', { participantId });
  });
}

export function buildLeaderboard(room) {
  return [...room.participants]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ position: i + 1, participantId: p.id, name: p.name, score: p.score, attempts: p.attempts }));
}

function sanitizeRoom(room) {
  const { adminToken, ...safe } = room;
  return safe;
}
