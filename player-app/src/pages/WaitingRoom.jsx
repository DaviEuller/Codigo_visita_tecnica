import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { part } = usePlayerSocket();

  useEffect(() => {
    if (part) navigate('/play');
  }, [part, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>Você entrou na sala!</CardTitle>
          <CardDescription>Aguardando o administrador iniciar o jogo...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
