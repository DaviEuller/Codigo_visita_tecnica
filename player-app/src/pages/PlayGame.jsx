import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Timer from '@/components/Timer.jsx';
import { usePlayerSocket } from '@/hooks/usePlayerSocket.js';
import { Bug, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayGame() {
  const navigate = useNavigate();
  const { gameCode, feedback, finished, submitCode, notifyTimeUp } = usePlayerSocket();
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (gameCode) setCode(gameCode.buggyCode);
  }, [gameCode]);

  useEffect(() => {
    if (feedback?.type === 'wrong') {
      setSending(false);
      setShake(true);
      const t = setTimeout(() => setShake(false), 420);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  useEffect(() => {
    if (feedback?.type === 'correct' || feedback?.type === 'timeUp') {
      navigate('/result');
    }
  }, [feedback, navigate]);

  useEffect(() => {
    if (finished) navigate('/result');
  }, [finished, navigate]);

  if (!gameCode) return null;

  function handleSubmit() {
    setSending(true);
    submitCode(code);
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-in-up">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            Encontre e corrija os erros de lógica
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edite o código abaixo e envie quando achar que está tudo certo.
          </p>
        </div>
        <Badge variant="accent" className="text-sm px-4 py-1.5">
          🐞 {gameCode.bugCount} erro{gameCode.bugCount === 1 ? '' : 's'} escondido{gameCode.bugCount === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="animate-in-up" style={{ animationDelay: '80ms' }}>
        <Timer timeLimit={gameCode.timeLimit} onTimeUp={notifyTimeUp} />
      </div>

      <Card
        className={cn(
          'overflow-hidden animate-in-up',
          shake && 'animate-shake border-destructive/60 glow-destructive'
        )}
        style={{ animationDelay: '140ms' }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-2 text-xs font-mono text-muted-foreground">codigo-com-bugs.{gameCode.language === 'javascript' ? 'js' : gameCode.language}</span>
        </div>
        <CardContent className="p-0">
          <Editor
            height="420px"
            defaultLanguage={gameCode.language}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
          />
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 pt-4">
          {feedback?.type === 'wrong' && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {feedback.message} (-{feedback.penalty} pts)
            </p>
          )}
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Enviar correção
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
