import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerSocketProvider } from './context/PlayerSocketContext.jsx';
import Join from './pages/Join.jsx';
import WaitingRoom from './pages/WaitingRoom.jsx';
import PlayGame from './pages/PlayGame.jsx';
import FinalResult from './pages/FinalResult.jsx';

export default function App() {
  return (
    <PlayerSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Join />} />
          <Route path="/waiting" element={<WaitingRoom />} />
          <Route path="/play" element={<PlayGame />} />
          <Route path="/result" element={<FinalResult />} />
        </Routes>
      </BrowserRouter>
    </PlayerSocketProvider>
  );
}
