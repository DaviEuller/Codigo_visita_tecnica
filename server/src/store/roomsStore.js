// Estado em memória. Trocar por Redis se precisar de múltiplas instâncias.
const rooms = new Map();

export function createRoom(room) {
  rooms.set(room.code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(code);
}

export function updateRoom(code, patch) {
  const room = rooms.get(code);
  if (!room) return null;
  Object.assign(room, patch);
  return room;
}

export function deleteRoom(code) {
  return rooms.delete(code);
}

export function listRooms() {
  return Array.from(rooms.values());
}
