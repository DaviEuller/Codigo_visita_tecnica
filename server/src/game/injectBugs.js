// Mutações simples de lógica para gerar o "código com erro".
// Cada mutação altera SÓ A PRIMEIRA ocorrência que encontrar, pra dar
// pra aplicar várias mutações diferentes sem uma pisar na outra.
const MUTATIONS = [
  { name: 'igualdade-fraca', find: /===/, replace: '==' },
  { name: 'atribuicao-no-lugar-de-comparacao', find: /if \((\w+) ==/, replace: 'if ($1 =' },
  { name: 'inverter-maior-igual', find: />=/, replace: '<=' },
  { name: 'inverter-menor-igual', find: /<=/, replace: '>=' },
  { name: 'off-by-one', find: /< (\w+\.length)/, replace: '<= $1' },
  { name: 'incremento-para-decremento', find: /\+\+/, replace: '--' },
  { name: 'decremento-para-incremento', find: /--/, replace: '++' },
  { name: 'negar-condicao', find: /if \((!?)(\w+)\)/, replace: (_, neg, v) => `if (${neg ? '' : '!'}${v})` },
  { name: 'trocar-and-por-or', find: /&&/, replace: '||' },
  { name: 'trocar-or-por-and', find: /\|\|/, replace: '&&' },
  { name: 'retornar-valor-fixo-errado', find: /return true;/, replace: 'return false;' },
  // marcador especial: tratado à parte no loop, ver swapLetterMutation()
  { name: 'letra-trocada', special: 'swapLetter' },
];

// Palavras reservadas do JS que nunca podem ser mexidas (senão quebra a sintaxe)
const RESERVED_WORDS = new Set([
  'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'class', 'extends', 'super', 'new', 'this',
  'typeof', 'instanceof', 'in', 'of', 'try', 'catch', 'finally', 'throw', 'async',
  'await', 'yield', 'import', 'export', 'default', 'from', 'as', 'true', 'false',
  'null', 'undefined', 'void', 'delete', 'static', 'get', 'set', 'arguments',
  'debugger', 'with', 'package', 'implements', 'interface', 'private', 'protected',
  'public', 'enum', 'console', 'log', 'Math', 'Array', 'Object', 'String', 'Number',
  'Boolean', 'length',
]);

/**
 * Bug de "digitação": pega um identificador (variável/parâmetro) que
 * contenha a letra "a" e troca essa letra por "g" em UMA ÚNICA ocorrência
 * no código (não em todas). Isso faz com que, naquele ponto específico,
 * o código passe a se referir a um identificador diferente/inexistente
 * — um erro sutil de referência, do tipo que passa despercebido na leitura
 * rápida (ex: "media" vira "medig" numa das linhas).
 */
function swapLetterMutation(code) {
  const regex = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
  const matches = [];
  const frequency = {};
  let match;
  while ((match = regex.exec(code)) !== null) {
    const word = match[0];
    if (RESERVED_WORDS.has(word)) continue;
    if (!word.toLowerCase().includes('a')) continue;
    matches.push({ word, index: match.index });
    frequency[word] = (frequency[word] || 0) + 1;
  }
  if (matches.length === 0) return null;

  // Prioriza identificadores que aparecem mais de uma vez: trocar a letra em
  // só UMA ocorrência quebra a referência entre declaração e uso (bug real).
  // Se não houver nenhum repetido, cai pra qualquer candidato disponível.
  const repeated = matches.filter((m) => frequency[m.word] >= 2);
  const pool = repeated.length > 0 ? repeated : matches;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const { word, index } = chosen;
  const idx = word.toLowerCase().indexOf('a');
  const isUpper = word[idx] === 'A';
  const swappedChar = isUpper ? 'G' : 'g';
  const swapped = word.slice(0, idx) + swappedChar + word.slice(idx + 1);

  return {
    buggyCode: code.slice(0, index) + swapped + code.slice(index + word.length),
    detail: `"${word}" → "${swapped}"`,
  };
}

/**
 * Injeta N erros de lógica DISTINTOS no código, cada um a partir de uma
 * mutação diferente, garantindo que a versão "com bug" seja diferente
 * da original em N pontos.
 */
export function injectBugs(code, count = 3) {
  let buggyCode = code;
  const applied = [];

  // embaralha a lista de mutações pra não pegar sempre as mesmas 3 primeiras
  const shuffled = [...MUTATIONS].sort(() => Math.random() - 0.5);

  for (const mutation of shuffled) {
    if (applied.length >= count) break;

    if (mutation.special === 'swapLetter') {
      const result = swapLetterMutation(buggyCode);
      if (!result) continue;
      buggyCode = result.buggyCode;
      applied.push(mutation.name);
      continue;
    }

    const regex = new RegExp(mutation.find.source, mutation.find.flags);
    if (!regex.test(buggyCode)) continue;

    const applyRegex = new RegExp(mutation.find.source, mutation.find.flags);
    const before = buggyCode;
    buggyCode = buggyCode.replace(applyRegex, mutation.replace);

    if (buggyCode !== before) {
      applied.push(mutation.name);
    }
  }

  return {
    buggyCode,
    expectedFix: code, // versão correta original, usada na validação
    bugsApplied: applied, // nomes das mutações aplicadas (útil pra debug/relatório do admin)
  };
}
