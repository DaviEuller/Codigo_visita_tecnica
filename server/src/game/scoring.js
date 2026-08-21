export const BASE_SCORE = 100;
export const WRONG_PENALTY = 40;
export const WRONG_EXTRA_TIME = 30; // segundos

export function bonusForRank(rank, totalPlayers) {
  if (totalPlayers <= 1) return 100;
  const raw = 10 + 90 * ((totalPlayers - rank) / (totalPlayers - 1));
  return Math.round(raw);
}

export function applyCorrectAnswer(participant, rank, totalPlayers) {
  const bonus = bonusForRank(rank, totalPlayers);
  participant.score += BASE_SCORE + bonus;
  participant.status = 'correct';
  participant.finishedAt = Date.now();
  return { bonus, totalGained: BASE_SCORE + bonus };
}

export function applyWrongAnswer(participant) {
  participant.attempts += 1;
  participant.score = Math.max(0, participant.score - WRONG_PENALTY);
  participant.timeLeft = (participant.timeLeft || 0) + WRONG_EXTRA_TIME;
  return { penalty: WRONG_PENALTY, extraTime: WRONG_EXTRA_TIME };
}
