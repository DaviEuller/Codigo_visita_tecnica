// Mutações simples de lógica para gerar o "código com erro".
//
// ESTRATÉGIA:
// 1. Busca TODAS as ocorrências possíveis no código ORIGINAL.
// 2. Embaralha os candidatos.
// 3. Escolhe candidatos sem sobreposição.
// 4. Aplica as substituições de trás para frente.
//
// Assim, cada bug fica em uma posição diferente e
// bugsApplied.length representa a quantidade real de bugs.

const MUTATIONS = [
  {
    name: 'igualdade-fraca',
    find: /===/g,
    replace: () => '==',
  },
  {
    name: 'atribuicao-no-lugar-de-comparacao',
    find: /if \((\w+) ==(?!=)/g,
    replace: (m, v) => `if (${v} =`,
  },
  {
    name: 'inverter-maior-igual',
    find: />=/g,
    replace: () => '<=',
  },
  {
    name: 'inverter-menor-igual',
    find: /<=/g,
    replace: () => '>=',
  },
  {
    name: 'off-by-one',
    find: /< (\w+\.length)/g,
    replace: (m, v) => `<= ${v}`,
  },
  {
    name: 'incremento-para-decremento',
    find: /\+\+/g,
    replace: () => '--',
  },
  {
    name: 'decremento-para-incremento',
    find: /--/g,
    replace: () => '++',
  },
  {
    name: 'negar-condicao',
    find: /if \((!?)(\w+)\)/g,
    replace: (m, neg, v) => `if (${neg ? '' : '!'}${v})`,
  },
  {
    name: 'trocar-and-por-or',
    find: /&&/g,
    replace: () => '||',
  },
  {
    name: 'trocar-or-por-and',
    find: /\|\|/g,
    replace: () => '&&',
  },
  {
    name: 'retornar-valor-fixo-errado',
    find: /return true;/g,
    replace: () => 'return false;',
  },

  // Marcador especial: candidatos gerados à parte.
  { name: 'letra-trocada', special: 'swapLetter' },
];

// Palavras reservadas do JS que nunca podem ser mexidas.
const RESERVED_WORDS = new Set([
  'var',
  'let',
  'const',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'class',
  'extends',
  'super',
  'new',
  'this',
  'typeof',
  'instanceof',
  'in',
  'of',
  'try',
  'catch',
  'finally',
  'throw',
  'async',
  'await',
  'yield',
  'import',
  'export',
  'default',
  'from',
  'as',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'delete',
  'static',
  'get',
  'set',
  'arguments',
  'debugger',
  'with',
  'package',
  'implements',
  'interface',
  'private',
  'protected',
  'public',
  'enum',
  'console',
  'log',
  'Math',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'length',
]);

/**
 * Encontra todas as ocorrências de uma mutação regex
 * no código ORIGINAL.
 */
function findRegexCandidates(code, mutation) {
  const regex = new RegExp(
    mutation.find.source,
    mutation.find.flags
  );

  const candidates = [];
  let match;

  while ((match = regex.exec(code)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    const replacement = mutation.replace(...match);

    if (replacement !== match[0]) {
      candidates.push({
        name: mutation.name,
        start,
        end,
        replacement,
      });
    }

    // Evita loop infinito em regex que encontre string vazia.
    if (regex.lastIndex === match.index) {
      regex.lastIndex += 1;
    }
  }

  return candidates;
}

/**
 * Gera candidatos para o bug de troca de letra em identificadores.
 *
 * Exemplo:
 *
 * media -> medig
 *
 * A alteração acontece em UMA ocorrência específica do identificador.
 */
function findSwapLetterCandidates(code) {
  const regex = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
  const occurrences = [];
  const frequency = {};

  let match;

  while ((match = regex.exec(code)) !== null) {
    const word = match[0];

    if (RESERVED_WORDS.has(word)) continue;
    if (!word.toLowerCase().includes('a')) continue;

    occurrences.push({
      word,
      index: match.index,
    });

    frequency[word] = (frequency[word] || 0) + 1;
  }

  if (occurrences.length === 0) {
    return [];
  }

  // Prioriza identificadores que aparecem mais de uma vez.
  const repeated = occurrences.filter(
    (o) => frequency[o.word] >= 2
  );

  const pool = repeated.length > 0 ? repeated : occurrences;

  return pool.map(({ word, index }) => {
    const idx = word.toLowerCase().indexOf('a');

    const isUpper = word[idx] === 'A';
    const swappedChar = isUpper ? 'G' : 'g';

    const replacement =
      word.slice(0, idx) +
      swappedChar +
      word.slice(idx + 1);

    return {
      name: 'letra-trocada',
      start: index,
      end: index + word.length,
      replacement,
      detail: `"${word}" → "${replacement}"`,
    };
  });
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

function shuffle(arr) {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/**
 * Injeta N erros distintos e não sobrepostos.
 *
 * Se o código não tiver candidatos suficientes,
 * bugsApplied.length será menor que count.
 */
export function injectBugs(code, count = 3) {
  let allCandidates = [];

  for (const mutation of MUTATIONS) {
    if (mutation.special === 'swapLetter') {
      allCandidates.push(
        ...findSwapLetterCandidates(code)
      );
    } else {
      allCandidates.push(
        ...findRegexCandidates(code, mutation)
      );
    }
  }

  const shuffled = shuffle(allCandidates);

  const chosen = [];
  const usedTypes = new Set();

  // Primeira passada:
  // tenta usar tipos de mutação diferentes.
  for (const candidate of shuffled) {
    if (chosen.length >= count) break;

    if (usedTypes.has(candidate.name)) continue;

    if (
      chosen.some((c) => overlaps(c, candidate))
    ) {
      continue;
    }

    chosen.push(candidate);
    usedTypes.add(candidate.name);
  }

  // Segunda passada:
  // se ainda faltar, permite repetir o tipo de mutação,
  // desde que seja outra posição do código.
  if (chosen.length < count) {
    for (const candidate of shuffled) {
      if (chosen.length >= count) break;

      if (chosen.includes(candidate)) continue;

      if (
        chosen.some((c) => overlaps(c, candidate))
      ) {
        continue;
      }

      chosen.push(candidate);
    }
  }

  // Aplica de trás para frente para preservar os índices.
  const ordered = [...chosen].sort(
    (a, b) => b.start - a.start
  );

  let buggyCode = code;

  for (const candidate of ordered) {
    buggyCode =
      buggyCode.slice(0, candidate.start) +
      candidate.replacement +
      buggyCode.slice(candidate.end);
  }

  return {
    buggyCode,
    expectedFix: code,

    // Quantidade REAL de bugs aplicados.
    bugsApplied: chosen.map(
      (candidate) => candidate.name
    ),

    // Quantidade solicitada pelo administrador.
    bugsRequested: count,
  };
}
