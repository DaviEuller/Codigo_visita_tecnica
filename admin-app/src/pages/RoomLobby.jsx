import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminSocket } from '@/context/AdminSocketContext.jsx';
import { SERVER_URL } from '@/lib/socket';

export default function RoomLobby() {
  const { code } = useParams();
  const navigate = useNavigate();
  const adminToken = sessionStorage.getItem(`adminToken:${code}`);
  const { participants, joinError, joinRoom, startGame: startGameCtx } = useAdminSocket();

  useEffect(() => {
    if (code && adminToken) joinRoom(code, adminToken);
  }, [code, adminToken, joinRoom]);

  const startGame = () => startGameCtx(code);

  const [sourceCode, setSourceCode] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSaveSource() {
    setSaving(true);
    try {
      await fetch(`${SERVER_URL}/api/rooms/${code}/source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, language: 'javascript', adminToken }),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleStart() {
    startGame();
    navigate(`/room/${code}/live`);
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-secondary/30">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sala {code}</h1>
        <Badge>{participants.length} participante(s)</Badge>
      </div>

      {joinError && <p className="text-sm text-destructive">{joinError}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Código-fonte completo</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-72 font-mono text-sm p-3 rounded-md border border-input bg-background"
            placeholder="Cole aqui o código correto. Ao iniciar, o sistema vai injetar os erros de lógica e enviar o mesmo código, com bugs, para todos os participantes."
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
          />
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" onClick={handleSaveSource} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar código'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participantes conectados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Badge key={p.id} variant="secondary">{p.name}</Badge>
          ))}
          {participants.length === 0 && <p className="text-sm text-muted-foreground">Aguardando participantes entrarem com o código {code}...</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStart} disabled={participants.length === 0 || !sourceCode}>
            Iniciar jogo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
