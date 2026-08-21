export function newRoom({ code, adminToken, maxParticipants = null, autoSplit = true, timeLimit = 300 }) {
  return {
    code,
    adminToken,
    adminSocketId: null,
    status: 'waiting', // waiting | running | finished
    sourceCode: '',
    language: 'javascript',
    maxParticipants,
    autoSplit,
    timeLimit,
    parts: [],
    participants: [],
    finishOrder: [],
  };
}

export function newParticipant({ id, socketId, name }) {
  return {
    id,
    socketId,
    name,
    partIndex: null,
    status: 'waiting', // waiting | solving | correct | failed_time
    score: 0,
    attempts: 0,
    timeLeft: null,
    finishedAt: null,
  };
}
