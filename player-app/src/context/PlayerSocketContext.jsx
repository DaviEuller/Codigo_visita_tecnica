import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';

const PlayerSocketContext = createContext(null);

export function PlayerSocketProvider({ children }) {
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [gameCode, setGameCode] = useState(null); // { buggyCode, language, timeLimit, bugCount }
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(null);

  useEffect(() => {
    socket.connect();

    const onJoined = () => setJoined(true);
    const onJoinError = ({ message }) => setJoinError(message);
    const onGameCode = (payload) => setGameCode(payload);
    const onWrong = (payload) => setFeedback({ type: 'wrong', ...payload });
    const onCorrect = (payload) => setFeedback({ type: 'correct', ...payload });
    const onTimeUp = (payload) => setFeedback({ type: 'timeUp', ...payload });
    const onFinished = ({ leaderboard }) => setFinished(leaderboard);
    const onKicked = () => setJoinError('Você foi removido da sala');

    socket.on('player:joined', onJoined);
    socket.on('player:joinError', onJoinError);
    socket.on('game:code', onGameCode);
    socket.on('submit:wrong', onWrong);
    socket.on('submit:correct', onCorrect);
    socket.on('game:timeUp', onTimeUp);
    socket.on('game:finished', onFinished);
    socket.on('player:kicked', onKicked);

    // debug: loga qualquer evento recebido, ajuda a ver no console se o server está falando com o client
    socket.onAny((event, ...args) => {
      console.log('[socket event]', event, args);
    });

    return () => {
      socket.off('player:joined', onJoined);
      socket.off('player:joinError', onJoinError);
      socket.off('game:code', onGameCode);
      socket.off('submit:wrong', onWrong);
      socket.off('submit:correct', onCorrect);
      socket.off('game:timeUp', onTimeUp);
      socket.off('game:finished', onFinished);
      socket.off('player:kicked', onKicked);
      socket.offAny();
    };
  }, []);

  const join = useCallback((roomCode, name) => {
    setJoinError(null);
    socket.emit('player:join', { roomCode, name });
  }, []);

  const submitCode = useCallback((code) => {
    socket.emit('player:submitCode', { code });
  }, []);

  const notifyTimeUp = useCallback(() => {
    socket.emit('player:timeUp');
  }, []);

  const value = { joined, joinError, gameCode, feedback, finished, join, submitCode, notifyTimeUp };

  return <PlayerSocketContext.Provider value={value}>{children}</PlayerSocketContext.Provider>;
}

export function usePlayerSocket() {
  const ctx = useContext(PlayerSocketContext);
  if (!ctx) {
    throw new Error('usePlayerSocket precisa estar dentro de <PlayerSocketProvider>');
  }
  return ctx;
}
