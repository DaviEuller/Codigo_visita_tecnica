import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import roomsRouter from './routes/rooms.js';
import { registerAdminHandlers } from './socket/adminHandlers.js';
import { registerPlayerHandlers } from './socket/playerHandlers.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomsRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  registerAdminHandlers(io, socket);
  registerPlayerHandlers(io, socket);

  socket.on('disconnect', () => {
    // TODO: tratar saída de admin/participante da sala
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`CodeGame server rodando na porta ${PORT}`);
});
