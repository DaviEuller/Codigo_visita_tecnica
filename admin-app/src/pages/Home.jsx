import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SERVER_URL } from '@/lib/socket';

export default function Home() {
  const navigate = useNavigate();
  const [maxParticipants, setMaxParticipants] = useState('');
  const [timeLimit, setTimeLimit] = useState(300);
  const [loading, setLoading] = useState(false);

  async function handleCreateRoom() {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          autoSplit: true,
          timeLimit: Number(timeLimit),
        }),
      });
      const data = await res.json();
      // guarda o adminToken localmente pra usar no socket/rotas
      sessionStorage.setItem(`adminToken:${data.roomCode}`, data.adminToken);
      navigate(`/room/${data.roomCode}/lobby`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>CodeGame — Painel do Administrador</CardTitle>
          <CardDescription>Crie a sala para a apresentação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Máximo de participantes (vazio = automático)</Label>
            <Input
              type="number"
              placeholder="Ex: 10"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tempo por participante (segundos)</Label>
            <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCreateRoom} disabled={loading}>
            {loading ? 'Criando...' : 'Criar sala'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
