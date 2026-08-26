import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, AlarmClock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Timer({ timeLimit, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const totalRef = useRef(timeLimit);
  // Bug corrigido: antes, o useEffect chamava onTimeUp() de novo a cada
  // re-render enquanto secondsLeft ficava em 0 (por exemplo, quando o
  // componente pai re-renderizava por outro motivo), porque a checagem
  // "secondsLeft <= 0" rodava toda vez sem nenhum controle de "já avisei".
  // Isso podia disparar o evento player:timeUp várias vezes pro servidor.
  // Agora um ref garante que o aviso dispara só uma vez.
  const firedRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeUp?.();
      }
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, onTimeUp]);

  const percent = (secondsLeft / totalRef.current) * 100;
  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(2, '0');
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, '0');

  const urgent = percent <= 20;
  const warning = percent > 20 && percent <= 50;

  return (
    <div
      className={cn(
        'space-y-2 rounded-2xl border border-border bg-card/80 glass-panel p-4',
        urgent && 'border-destructive/50 glow-destructive'
      )}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold text-muted-foreground">
          {urgent ? <AlarmClock className="h-4 w-4 text-destructive animate-shake" /> : <Clock className="h-4 w-4" />}
          Tempo restante
        </span>
        <span
          className={cn(
            'font-mono text-lg font-bold tabular-nums',
            urgent ? 'text-destructive' : warning ? 'text-warning' : 'text-primary'
          )}
        >
          {mm}:{ss}
        </span>
      </div>
      <Progress
        value={percent}
        indicatorClassName={cn(urgent ? 'bg-destructive' : warning ? 'bg-warning' : 'bg-primary')}
      />
    </div>
  );
}
