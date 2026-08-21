import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';

export default function Timer({ timeLimit, extraSeconds = 0, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit);
  const totalRef = useRef(timeLimit);

  useEffect(() => {
    setSecondsLeft((prev) => prev + extraSeconds);
    totalRef.current += extraSeconds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, onTimeUp]);

  const percent = (secondsLeft / totalRef.current) * 100;
  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(2, '0');
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, '0');

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Tempo restante</span>
        <span className="font-mono">{mm}:{ss}</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
