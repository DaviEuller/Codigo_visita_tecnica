import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminSocketProvider } from './context/AdminSocketContext.jsx';
import Home from './pages/Home.jsx';
import RoomLobby from './pages/RoomLobby.jsx';
import GameLive from './pages/GameLive.jsx';

export default function App() {
  return (
    <AdminSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:code/lobby" element={<RoomLobby />} />
          <Route path="/room/:code/live" element={<GameLive />} />
        </Routes>
      </BrowserRouter>
    </AdminSocketProvider>
  );
}
