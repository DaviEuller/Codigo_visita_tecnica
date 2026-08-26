import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';
import { Bug, ArrowRight, Loader2 } from 'lucide-react';

export default function Join() {
  const navigate = useNavigate();
  const { joined, joinError, join } = usePlayerSocket();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (joined) navigate('/waiting');
  }, [joined, navigate]);

  useEffect(() => {
    if (joinError) setSubmitting(false);
  }, [joinError]);

  function handleJoin() {
    setSubmitting(true);
    join(roomCode, name);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-in-up">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="relative animate-float">
            <div className="h-16 w-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary">
              <Bug className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-gradient">Code Bug Hunt</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Encontre os erros de lógica antes de todo mundo e corra pro topo do ranking.
          </p>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Entrar na partida</CardTitle>
            <CardDescription>Digite o código da sala fornecido pelo apresentador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seu nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria" maxLength={24} />
            </div>
            <div className="space-y-2">
              <Label>Código da sala</Label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="EX: ABC123"
                maxLength={6}
                className="font-mono text-lg tracking-[0.3em] text-center uppercase"
              />
            </div>
            {joinError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 animate-shake">
                {joinError}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={!name || !roomCode || submitting}
              onClick={handleJoin}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  Entrar na sala <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
