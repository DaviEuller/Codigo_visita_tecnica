import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';

export default function Join() {
  const navigate = useNavigate();
  const { joined, joinError, join } = usePlayerSocket();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    if (joined) navigate('/waiting');
  }, [joined, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar no CodeGame</CardTitle>
          <CardDescription>Digite o código da sala fornecido pelo apresentador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seu nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria" />
          </div>
          <div className="space-y-2">
            <Label>Código da sala</Label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              maxLength={6}
            />
          </div>
          {joinError && <p className="text-sm text-destructive">{joinError}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={!name || !roomCode} onClick={() => join(roomCode, name)}>
            Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
