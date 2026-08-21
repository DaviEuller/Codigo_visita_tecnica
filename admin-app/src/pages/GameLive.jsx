import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminSocket } from '@/context/AdminSocketContext.jsx';

const STATUS_LABEL = {
  waiting: 'Aguardando',
  solving: 'Resolvendo',
  correct: 'Acertou',
  failed_time: 'Tempo esgotado',
};

const STATUS_VARIANT = {
  waiting: 'outline',
  solving: 'secondary',
  correct: 'default',
  failed_time: 'destructive',
};

export default function GameLive() {
  const { code } = useParams();
  const adminToken = sessionStorage.getItem(`adminToken:${code}`);
  const { participants, leaderboard, joinRoom } = useAdminSocket();

  // Como o Context já foi populado desde a RoomLobby, isso é só uma garantia
  // caso o usuário chegue direto nesta URL (ex: refresh da página).
  useEffect(() => {
    if (code && adminToken) joinRoom(code, adminToken);
  }, [code, adminToken, joinRoom]);

  return (
    <div className="min-h-screen p-6 space-y-6 bg-secondary/30">
      <h1 className="text-2xl font-bold">Sala {code} — Ao vivo</h1>

      <Card>
        <CardHeader><CardTitle>Participantes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {participants
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Tentativas: {p.attempts}</span>
                  <span className="font-semibold text-foreground">{p.score} pts</span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {leaderboard && (
        <Card>
          <CardHeader><CardTitle>Ranking final</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.map((r) => (
              <div key={r.participantId} className="flex items-center justify-between rounded-md border p-3">
                <span>{r.position}º — {r.name}</span>
                <span className="font-semibold">{r.score} pts</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
