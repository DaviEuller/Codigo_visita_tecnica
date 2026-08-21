/**
 * Divide o código-fonte em N partes lógicas (uma por participante).
 * Estratégia simples: separa por blocos de função/linha em branco.
 * Para a apresentação, o ideal é o admin colar um código já organizado
 * em N funções/blocos independentes.
 */
export function splitCodeIntoParts(sourceCode, n) {
  const blocks = sourceCode
    .split(/\n\s*\n/) // separa por linhas em branco
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length >= n) {
    return groupInto(blocks, n);
  }

  // fallback: divide por linhas se não houver blocos suficientes
  const lines = sourceCode.split('\n');
  const chunkSize = Math.ceil(lines.length / n);
  const parts = [];
  for (let i = 0; i < n; i++) {
    parts.push(lines.slice(i * chunkSize, (i + 1) * chunkSize).join('\n'));
  }
  return parts;
}

function groupInto(blocks, n) {
  const groups = Array.from({ length: n }, () => []);
  blocks.forEach((block, i) => groups[i % n].push(block));
  return groups.map((g) => g.join('\n\n'));
}
