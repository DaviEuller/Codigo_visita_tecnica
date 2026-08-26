import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';
import { Trophy, Medal, Clock, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONFETTI_COLORS = ['bg-primary', 'bg-accent', 'bg-warning', 'bg-destructive', 'bg-success'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={cn('confetti-piece h-2.5 w-2.5', p.rotate ? 'rounded-full' : 'rounded-sm', p.color)}
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
        />
      ))}
    </div>
  );
}

function medalFor(position) {
  if (position === 1) return { icon: Trophy, className: 'text-warning' };
  if (position === 2) return { icon: Medal, className: 'text-slate-300' };
  if (position === 3) return { icon: Medal, className: 'text-amber-600' };
  return null;
}

export default function FinalResult() {
  const { feedback, finished } = usePlayerSocket();
  const isCorrect = feedback?.type === 'correct';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {isCorrect && <Confetti />}
      <Card className="w-full max-w-md glass-panel animate-in-up relative z-10">
        <CardHeader className="items-center text-center">
          {isCorrect ? (
            <div className="h-16 w-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center mb-2 glow-primary animate-pop">
              <PartyPopper className="h-8 w-8 text-success" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-2 animate-pop">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-2xl">Resultado</CardTitle>
          <CardDescription className="text-base">
            {feedback?.type === 'correct' && (
              <>
                Você acertou! Posição <span className="font-bold text-foreground">{feedback.rank}º</span> —{' '} Numero da chave é 081
                <span className="font-bold text-success">+{feedback.totalGained} pts</span>
              </>
            )}
            {feedback?.type === 'timeUp' && (
              <>Tempo esgotado. Pontuação final: <span className="font-bold text-foreground">{feedback.finalScore} pts</span></>
            )}  
            {!feedback && 'Aguardando o fim da partida...'}
          </CardDescription>
          
          <CardDescription className="text-base">
            {feedback?.type === 'correct' && (
              <>
                Você acertou! Posição <span className="font-bold text-foreground">{feedback.rank}º</span> —{' '}
                <span className="font-bold text-success">+{feedback.totalGained} pts</span>
              </>
            )}
            {feedback?.type === 'timeUp' && (
              <>Tempo esgotado. Pontuação final: <span className="font-bold text-foreground">{feedback.finalScore} pts</span></>
            )}
            {!feedback && 'Aguardando o fim da partida...'}
          </CardDescription>

          
        </CardHeader>
        {finished && (
          <CardContent className="space-y-2">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">Ranking geral</h3>
            {finished.map((r) => {
              const medal = medalFor(r.position);
              const Icon = medal?.icon;
              return (
                <div
                  key={r.participantId}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-3 py-2.5',
                    r.position === 1 ? 'border-warning/40 bg-warning/10' : 'border-border bg-secondary/40'
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
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
        )}
      </Card>
    </div>
  );
}
