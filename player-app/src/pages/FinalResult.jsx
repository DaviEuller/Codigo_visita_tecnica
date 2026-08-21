import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';

export default function FinalResult() {
  const { feedback, finished } = usePlayerSocket();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>
            {feedback?.type === 'correct' && `Você acertou! Posição: ${feedback.rank}º — +${feedback.totalGained} pts`}
            {feedback?.type === 'timeUp' && `Tempo esgotado. Pontuação final: ${feedback.finalScore} pts`}
          </CardDescription>
        </CardHeader>
        {finished && (
          <CardContent className="space-y-2">
            <h3 className="font-semibold">Ranking geral</h3>
            {finished.map((r) => (
              <div key={r.participantId} className="flex justify-between text-sm border-b py-1">
                <span>{r.position}º {r.name}</span>
                <span>{r.score} pts</span>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
