// Mutações simples de lógica para gerar o "código com erro".
const MUTATIONS = [
  { name: 'igualdade-fraca', find: /===/g, replace: '==' },
  { name: 'atribuicao-no-lugar-de-comparacao', find: /if \((\w+) ==/g, replace: 'if ($1 =' },
  { name: 'inverter-maior-menor', find: />=/g, replace: '<=' },
  { name: 'inverter-menor-maior', find: /<=/g, replace: '>=' },
  { name: 'off-by-one', find: /< (\w+\.length)/g, replace: '<= $1' },
  { name: 'incremento-para-decremento', find: /\+\+/g, replace: '--' },
  { name: 'negar-condicao', find: /if \((!?)(\w+)\)/, replace: (_, neg, v) => `if (${neg ? '' : '!'}${v})` },
];

export function injectRandomBug(code) {
  const applicable = MUTATIONS.filter((m) => m.find.test(code));
  m_reset(applicable);

  if (applicable.length === 0) {
    return { buggyCode: code, expectedFix: code, mutation: null };
  }

  const mutation = applicable[Math.floor(Math.random() * applicable.length)];
  const buggyCode = code.replace(mutation.find, mutation.replace);

  return {
    buggyCode,
    expectedFix: code, // versão correta original, usada na validação
    mutation: mutation.name,
  };
}

function m_reset(mutations) {
  mutations.forEach((m) => (m.find.lastIndex = 0));
}
