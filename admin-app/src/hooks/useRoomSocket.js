import { useEffect, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';

export function useAdminRoomSocket({ roomCode, adminToken }) {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    if (!roomCode || !adminToken) return;

    socket.connect();
    socket.emit('admin:joinRoom', { roomCode, adminToken });

    socket.on('admin:joined', ({ room }) => {
      setRoom(room);
      setParticipants(room.participants || []);
    });

    socket.on('room:participantJoined', ({ participant }) => {
      setParticipants((prev) => [...prev, participant]);
    });

    socket.on('room:participantLeft', ({ participantId }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    });

    socket.on('game:started', ({ room }) => setRoom(room));

    socket.on('game:participantUpdate', (update) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === update.participantId ? { ...p, ...update } : p))
      );
    });

    socket.on('game:participantSolved', ({ participantId, rank, scoreGained }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: 'correct' } : p))
      );
    });

    socket.on('game:finished', ({ leaderboard }) => setLeaderboard(leaderboard));

    return () => {
      socket.off('admin:joined');
      socket.off('room:participantJoined');
      socket.off('room:participantLeft');
      socket.off('game:started');
      socket.off('game:participantUpdate');
      socket.off('game:participantSolved');
      socket.off('game:finished');
    };
  }, [roomCode, adminToken]);

  const startGame = useCallback(() => {
    socket.emit('admin:startGame', { roomCode });
  }, [roomCode]);

  const endGame = useCallback(() => {
    socket.emit('admin:endGame', { roomCode });
  }, [roomCode]);

  return { room, participants, leaderboard, startGame, endGame };
}
