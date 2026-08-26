import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SERVER_URL } from '@/lib/socket';
import { Bug, Users, Timer, Bomb, Loader2, PlaySquare } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [maxParticipants, setMaxParticipants] = useState('');
  const [timeLimit, setTimeLimit] = useState(300);
  const [bugCount, setBugCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreateRoom() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          timeLimit: Number(timeLimit),
          bugCount: Math.min(10, Math.max(1, Number(bugCount) || 3)),
        }),
      });
      if (!res.ok) throw new Error('Não foi possível criar a sala. Verifique se o servidor está rodando.');
      const data = await res.json();
      sessionStorage.setItem(`adminToken:${data.roomCode}`, data.adminToken);
      navigate(`/room/${data.roomCode}/lobby`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in-up">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center glow-accent animate-float">
            <Bug className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-gradient">Code Bug Hunt</span>
          </h1>
          <p className="text-sm text-muted-foreground">Painel do administrador — crie a sala da partida</p>
        </div>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Nova sala</CardTitle>
            <CardDescription>Configure as regras antes de começar a apresentação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Máx. de participantes (vazio = automático)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Ex: 10"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Tempo por participante (segundos)</Label>
              <Input type="number" min={30} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Bomb className="h-3.5 w-3.5" /> Quantidade de erros no código (1 a 10)</Label>
              <Input type="number" min={1} max={10} value={bugCount} onChange={(e) => setBugCount(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                O jogo tenta injetar exatamente essa quantidade; se o código colado for muito curto, pode injetar menos — o participante sempre verá o número real.
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" variant="accent" onClick={handleCreateRoom} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                </>
              ) : (
                <>
                  <PlaySquare className="h-4 w-4" /> Criar sala
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
