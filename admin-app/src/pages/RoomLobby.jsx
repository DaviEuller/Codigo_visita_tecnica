import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminSocket } from '@/context/AdminSocketContext.jsx';
import { SERVER_URL } from '@/lib/socket';
import { Copy, Check, Users, Bug, Code2, PlaySquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoomLobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const adminToken = sessionStorage.getItem(`adminToken:${code}`);
  const { participants, joinError, joinRoom, startGame: startGameCtx, room } = useAdminSocket();

  useEffect(() => {
    if (code && adminToken) joinRoom(code, adminToken);
  }, [code, adminToken, joinRoom]);

  const startGame = () => startGameCtx(code);

  const [sourceCode, setSourceCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [bugCount, setBugCount] = useState(3);
  const [savingBugCount, setSavingBugCount] = useState(false);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (room?.bugCount !== undefined) setBugCount(room.bugCount);
  }, [room?.bugCount]);

  async function handleSaveBugCount() {
    setSavingBugCount(true);
    try {
      await fetch(`${SERVER_URL}/api/rooms/${code}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugCount: Number(bugCount), adminToken }),
      });
    } finally {
      setSavingBugCount(false);
    }
  }

  async function handleSaveSource() {
    setSaving(true);
    try {
      await fetch(`${SERVER_URL}/api/rooms/${code}/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, language: 'javascript', adminToken }),
      });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyCode() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleStart() {
    setStarting(true);
    startGame();
    navigate(`/room/${code}/live`);
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-in-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Código da sala</p>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-3xl md:text-4xl font-black font-mono tracking-[0.2em] text-gradient">{code}</h1>
            <Button variant="ghost" size="icon" onClick={handleCopyCode} title="Copiar código">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Badge variant="accent" className="text-sm px-4 py-1.5">
          <Users className="h-3.5 w-3.5" /> {participants.length} participante{participants.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {joinError && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
          {joinError}
        </p>
      )}

      <Card className="animate-in-up" style={{ animationDelay: '60ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Código-fonte completo</CardTitle>
          <CardDescription>Cole o código correto. Ao iniciar, o sistema injeta os erros de lógica e envia a mesma versão com bugs para todos.</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-72 font-mono text-sm p-4 rounded-xl border border-input bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="function media(numeros) { ... }"
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
          />
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" onClick={handleSaveSource} disabled={saving || !sourceCode}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : savedOk ? <><Check className="h-4 w-4 text-success" /> Salvo!</> : 'Salvar código'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="animate-in-up" style={{ animationDelay: '120ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bug className="h-5 w-5 text-accent" /> Quantidade de erros</CardTitle>
          <CardDescription>Erros de lógica injetados no código (1 a 10). O número exibido ao participante sempre reflete o que realmente foi injetado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={10}
              value={bugCount}
              onChange={(e) => setBugCount(e.target.value)}
              className="max-w-[120px]"
            />
            <Button variant="outline" onClick={handleSaveBugCount} disabled={savingBugCount}>
              {savingBugCount ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-in-up" style={{ animationDelay: '180ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Participantes conectados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Badge key={p.id} variant="secondary" className="text-sm px-3 py-1.5">{p.name}</Badge>
          ))}
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aguardando participantes entrarem com o código <span className="font-mono font-semibold text-foreground">{code}</span>...
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={participants.length === 0 || !sourceCode || starting}
          >
            {starting ? <><Loader2 className="h-4 w-4 animate-spin" /> Iniciando...</> : <><PlaySquare className="h-4 w-4" /> Iniciar jogo</>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
