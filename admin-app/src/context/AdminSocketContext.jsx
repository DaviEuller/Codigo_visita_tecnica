import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';

const AdminSocketContext = createContext(null);

export function AdminSocketProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    socket.connect();

    const onJoined = ({ room }) => {
      setRoom(room);
      setParticipants(room.participants || []);
    };
    const onJoinError = ({ message }) => setJoinError(message);
    const onParticipantJoined = ({ participant }) =>
      setParticipants((prev) => [...prev, participant]);
    const onParticipantLeft = ({ participantId }) =>
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    const onStarted = ({ room }) => setRoom(room);
    const onParticipantUpdate = (update) =>
      setParticipants((prev) => prev.map((p) => (p.id === update.participantId ? { ...p, ...update } : p)));
    const onParticipantSolved = ({ participantId }) =>
      setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, status: 'correct' } : p)));
    const onFinished = ({ leaderboard }) => setLeaderboard(leaderboard);

    socket.on('admin:joined', onJoined);
    socket.on('admin:joinError', onJoinError);
    socket.on('room:participantJoined', onParticipantJoined);
    socket.on('room:participantLeft', onParticipantLeft);
    socket.on('game:started', onStarted);
    socket.on('game:participantUpdate', onParticipantUpdate);
    socket.on('game:participantSolved', onParticipantSolved);
    socket.on('game:finished', onFinished);

    socket.onAny((event, ...args) => console.log('[admin socket event]', event, args));

    return () => {
      socket.off('admin:joined', onJoined);
      socket.off('admin:joinError', onJoinError);
      socket.off('room:participantJoined', onParticipantJoined);
      socket.off('room:participantLeft', onParticipantLeft);
      socket.off('game:started', onStarted);
      socket.off('game:participantUpdate', onParticipantUpdate);
      socket.off('game:participantSolved', onParticipantSolved);
      socket.off('game:finished', onFinished);
      socket.offAny();
    };
  }, []);

  const joinRoom = useCallback((roomCode, adminToken) => {
    socket.emit('admin:joinRoom', { roomCode, adminToken });
  }, []);

  const startGame = useCallback((roomCode) => {
    socket.emit('admin:startGame', { roomCode });
  }, []);

  const endGame = useCallback((roomCode) => {
    socket.emit('admin:endGame', { roomCode });
  }, []);

  const value = { room, participants, leaderboard, joinError, joinRoom, startGame, endGame };

  return <AdminSocketContext.Provider value={value}>{children}</AdminSocketContext.Provider>;
}

export function useAdminSocket() {
  const ctx = useContext(AdminSocketContext);
  if (!ctx) throw new Error('useAdminSocket precisa estar dentro de <AdminSocketProvider>');
  return ctx;
}
