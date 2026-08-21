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
];

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
