import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminSocket } from '@/context/AdminSocketContext.jsx';
import { Trophy, Medal, Hourglass, CheckCircle2, XCircle, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_LABEL = {
  waiting: 'Aguardando',
  solving: 'Resolvendo',
  correct: 'Acertou',
  failed_time: 'Tempo esgotado',
};

const STATUS_VARIANT = {
  waiting: 'outline',
  solving: 'accent',
  correct: 'success',
  failed_time: 'destructive',
};

const STATUS_ICON = {
  waiting: Hourglass,
  solving: Hourglass,
  correct: CheckCircle2,
  failed_time: XCircle,
};

function medalFor(position) {
  if (position === 1) return { icon: Trophy, className: 'text-warning' };
  if (position === 2) return { icon: Medal, className: 'text-slate-300' };
  if (position === 3) return { icon: Medal, className: 'text-amber-600' };
  return null;
}

export default function GameLive() {
  const { code } = useParams();
  const adminToken = sessionStorage.getItem(`adminToken:${code}`);
  const { participants, leaderboard, bugCountInfo, joinRoom } = useAdminSocket();

  // Como o Context já foi populado desde a RoomLobby, isso é só uma garantia
  // caso o usuário chegue direto nesta URL (ex: refresh da página).
  useEffect(() => {
    if (code && adminToken) joinRoom(code, adminToken);
  }, [code, adminToken, joinRoom]);

  const mismatch = bugCountInfo && bugCountInfo.actualBugCount !== bugCountInfo.requestedBugCount;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-in-up">
        <h1 className="text-2xl font-extrabold">
          Sala <span className="font-mono text-gradient">{code}</span> — Ao vivo
        </h1>
        {bugCountInfo && (
          <Badge variant={mismatch ? 'warning' : 'accent'} className="text-sm px-4 py-1.5">
            <Bug className="h-3.5 w-3.5" /> {bugCountInfo.actualBugCount} erro(s) injetado(s)
          </Badge>
        )}
      </div>

      {mismatch && (
        <p className="flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2 animate-in-up">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Foram pedidos {bugCountInfo.requestedBugCount} erros, mas o código colado só permitiu injetar{' '}
          {bugCountInfo.actualBugCount} de forma distinta (sem sobreposição). Os participantes foram avisados do
          número correto.
        </p>
      )}

      <Card className="animate-in-up" style={{ animationDelay: '60ms' }}>
        <CardHeader><CardTitle>Participantes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {participants
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((p) => {
              const Icon = STATUS_ICON[p.status] || Hourglass;
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={STATUS_VARIANT[p.status]}>
                      <Icon className="h-3 w-3" /> {STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tentativas: {p.attempts}</span>
                    <span className="font-mono font-semibold text-foreground">{p.score} pts</span>
                  </div>
                </div>
              );
            })}
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum participante nesta sala.</p>
          )}
        </CardContent>
      </Card>

      {leaderboard && (
        <Card className="animate-in-up border-warning/30 glow-primary" style={{ animationDelay: '120ms' }}>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" /> Ranking final</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.map((r) => {
              const medal = medalFor(r.position);
              const Icon = medal?.icon;
              return (
                <div
                  key={r.participantId}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3',
                    r.position === 1 ? 'border-warning/40 bg-warning/10' : 'border-border bg-secondary/30'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {Icon ? <Icon className={cn('h-4 w-4', medal.className)} /> : (
                      <span className="w-4 text-center text-xs text-muted-foreground">{r.position}º</span>
                    )}
                    {r.name}
                  </span>
                  <span className="font-mono font-semibold">{r.score} pts</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
