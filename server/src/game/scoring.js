export const BASE_SCORE = 100;
export const WRONG_PENALTY = 40;

// Quanto mais tempo restante o jogador tiver ao acertar, maior o bônus.
// timeLeftSeconds: segundos que ainda restavam quando o jogador acertou.
// timeLimitSeconds: tempo total da sala (room.timeLimit).
// Bônus varia de 10 (acertou quase no fim do tempo) a 100 (acertou muito rápido).
export function bonusForTime(timeLeftSeconds, timeLimitSeconds) {
  if (!timeLimitSeconds || timeLimitSeconds <= 0) return 10;
  const fraction = Math.max(0, Math.min(1, timeLeftSeconds / timeLimitSeconds));
  return Math.round(10 + 90 * fraction);
}

export function applyCorrectAnswer(participant, timeLeftSeconds, timeLimitSeconds) {
  const bonus = bonusForTime(timeLeftSeconds, timeLimitSeconds);
  participant.score += BASE_SCORE + bonus;
  participant.status = 'correct';
  participant.finishedAt = Date.now();
  return { bonus, totalGained: BASE_SCORE + bonus };
}

export function applyWrongAnswer(participant) {
  participant.attempts += 1;
  participant.score = Math.max(0, participant.score - WRONG_PENALTY);
  // Errar não soma mais tempo — só desconta pontos.
  return { penalty: WRONG_PENALTY };
}
