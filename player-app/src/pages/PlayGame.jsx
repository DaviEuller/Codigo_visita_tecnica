import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Timer from '@/components/Timer.jsx';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';

export default function PlayGame() {
  const navigate = useNavigate();
  const { gameCode, feedback, finished, submitCode, notifyTimeUp } = usePlayerSocket();
  const [code, setCode] = useState('');
  const [extraSeconds, setExtraSeconds] = useState(0);

  useEffect(() => {
    if (gameCode) setCode(gameCode.buggyCode);
  }, [gameCode]);

  useEffect(() => {
    if (feedback?.type === 'wrong') {
      setExtraSeconds((s) => s + (feedback.extraTime || 0));
    }
    if (feedback?.type === 'correct' || feedback?.type === 'timeUp') {
      navigate('/result');
    }
  }, [feedback, navigate]);

  useEffect(() => {
    if (finished) navigate('/result');
  }, [finished, navigate]);

  if (!gameCode) return null;

  return (
    <div className="min-h-screen p-4 space-y-4 bg-secondary/30">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Encontre e corrija os erros de lógica</h1>
        <Badge variant="outline">{gameCode.bugCount} erro(s) no código</Badge>
      </div>

      <Timer timeLimit={gameCode.timeLimit} extraSeconds={extraSeconds} onTimeUp={notifyTimeUp} />

      <Card>
        <CardHeader>
          <CardTitle>Código com bugs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Editor
            height="400px"
            defaultLanguage={gameCode.language}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          {feedback?.type === 'wrong' && (
            <p className="text-sm text-destructive">
              {feedback.message} (-{feedback.penalty} pts, +{feedback.extraTime}s)
            </p>
          )}
          <Button className="w-full" onClick={() => submitCode(code)}>
            Enviar correção
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
