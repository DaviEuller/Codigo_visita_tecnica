import { Router } from 'express';
import { nanoid, customAlphabet } from 'nanoid';
import { createRoom, getRoom, updateRoom, deleteRoom } from '../store/roomsStore.js';
import { newRoom } from '../game/Room.js';

const genCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

// Limita a quantidade de erros entre 1 e 10 (a lista de mutações disponíveis
// tem um limite de tipos diferentes; pedir mais do que isso simplesmente
// aplica o máximo possível, sem quebrar nada).
function clampBugCount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 3;
  return Math.min(10, Math.max(1, Math.round(n)));
}

const router = Router();

// POST /api/rooms  -> cria sala
router.post('/', (req, res) => {
  const { maxParticipants = null, timeLimit = 300, bugCount = 3 } = req.body || {};
  const code = genCode();
  const adminToken = nanoid();

  const room = newRoom({
    code,
    adminToken,
    maxParticipants,
    timeLimit,
    bugCount: clampBugCount(bugCount),
  });
  createRoom(room);

  res.status(201).json({ roomCode: code, adminToken });
});

// GET /api/rooms/:code -> valida sala antes de conectar no socket
router.get('/:code', (req, res) => {
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });

  res.json({
    code: room.code,
    status: room.status,
    participantsCount: room.participants.length,
    maxParticipants: room.maxParticipants,
  });
});

// POST /api/rooms/:code/source -> envia código-fonte completo
router.post('/:code/source', (req, res) => {
  const { sourceCode, language = 'javascript', adminToken } = req.body || {};
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });
  if (room.adminToken !== adminToken) return res.status(403).json({ message: 'Token inválido' });

  updateRoom(room.code, { sourceCode, language });
  res.json({ ok: true });
});

// POST /api/rooms/:code/errors -> define erros manuais ou autoGenerate
router.post('/:code/errors', (req, res) => {
  const { manualErrors = [], autoGenerate = true, adminToken } = req.body || {};
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });
  if (room.adminToken !== adminToken) return res.status(403).json({ message: 'Token inválido' });

  updateRoom(room.code, { manualErrors, autoGenerate });
  res.json({ ok: true });
});

// PATCH /api/rooms/:code/settings
router.patch('/:code/settings', (req, res) => {
  const { maxParticipants, timeLimit, bugCount, adminToken } = req.body || {};
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });
  if (room.adminToken !== adminToken) return res.status(403).json({ message: 'Token inválido' });

  const patch = {};
  if (maxParticipants !== undefined) patch.maxParticipants = maxParticipants;
  if (timeLimit !== undefined) patch.timeLimit = timeLimit;
  if (bugCount !== undefined) patch.bugCount = clampBugCount(bugCount);

  updateRoom(room.code, patch);
  res.json({ ok: true, bugCount: patch.bugCount });
});

// GET /api/rooms/:code/leaderboard
router.get('/:code/leaderboard', (req, res) => {
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });

  const leaderboard = [...room.participants]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ position: i + 1, name: p.name, score: p.score, attempts: p.attempts }));

  res.json({ leaderboard });
});

// DELETE /api/rooms/:code
router.delete('/:code', (req, res) => {
  const { adminToken } = req.body || {};
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ message: 'Sala não encontrada' });
  if (room.adminToken !== adminToken) return res.status(403).json({ message: 'Token inválido' });

  deleteRoom(room.code);
  res.json({ ok: true });
});

export default router;
