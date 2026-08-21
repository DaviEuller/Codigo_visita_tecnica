export function newRoom({ code, adminToken, maxParticipants = null, timeLimit = 300, bugCount = 3 }) {
  return {
    code,
    adminToken,
    adminSocketId: null,
    status: 'waiting', // waiting | running | finished
    sourceCode: '',
    language: 'javascript',
    maxParticipants,
    timeLimit,
    bugCount, // quantidade de erros de lógica injetados no código
    buggyCode: '',   // código com os erros, igual para todos os participantes
    expectedFix: '', // código correto original, usado na validação
    bugsApplied: [],
    participants: [],
    finishOrder: [],
  };
}

export function newParticipant({ id, socketId, name }) {
  return {
    id,
    socketId,
    name,
    status: 'waiting', // waiting | solving | correct | failed_time
    score: 0,
    attempts: 0,
    timeLeft: null,
    finishedAt: null,
  };
}
