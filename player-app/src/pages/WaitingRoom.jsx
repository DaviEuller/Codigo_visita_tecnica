import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';
import { Bug, Sparkles } from 'lucide-react';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { gameCode } = usePlayerSocket();

  useEffect(() => {
    if (gameCode) navigate('/play');
  }, [gameCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center glass-panel animate-in-up">
        <CardHeader className="items-center">
          <div className="relative mb-2">
            <div className="h-20 w-20 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center animate-pulse-ring">
              <Bug className="h-9 w-9 text-accent animate-float" />
            </div>
            <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <CardTitle className="text-xl">Você entrou na sala!</CardTitle>
          <CardDescription className="flex items-center justify-center gap-1">
            Aguardando o administrador iniciar o jogo
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:-0.3s]">.</span>
              <span className="animate-bounce [animation-delay:-0.15s]">.</span>
              <span className="animate-bounce">.</span>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
