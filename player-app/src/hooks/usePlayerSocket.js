// Re-exporta o hook do Context para manter o mesmo import (@/hooks/usePlayerSocket.js)
// usado nas páginas. O estado real vive em PlayerSocketProvider (src/context).
export { usePlayerSocket } from '@/context/PlayerSocketContext.jsx';
