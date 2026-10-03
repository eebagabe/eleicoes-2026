import type { Resultado } from './tse'

/**
 * Modo simulação: gera votos fictícios sobre os dados reais de candidatos do TSE,
 * para visualizar o app antes do início da apuração. Nunca é ativado por padrão.
 */
const CHAVE = 'apuracao:simulacao'
const DURACAO_MS = 10 * 60_000 // apuração simulada completa em 10 minutos

function lerInicio(): number | null {
  try {
    const v = localStorage.getItem(CHAVE)
    return v ? Number(v) : null
  } catch {
    return null
  }
}

export const simulacaoAtiva = () => lerInicio() !== null

export function alternarSimulacao() {
  try {
    if (simulacaoAtiva()) localStorage.removeItem(CHAVE)
    else localStorage.setItem(CHAVE, String(Date.now()))
  } catch {
    /* sem storage: ignora */
  }
  window.location.reload()
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

export function simular(r: Resultado): Resultado {
  const inicio = lerInicio()
  if (inicio === null) return r
  // cada abrangência avança num ritmo levemente diferente
  const ritmo = 0.75 + hash(r.abrangencia) * 0.5
  const progresso = Math.min(1, ((Date.now() - inicio) / DURACAO_MS) * ritmo)
  const totalizadas = Math.round(r.secoes.total * progresso)
  const comparecimento = Math.round(r.eleitorado.total * 0.79 * progresso)
  const brancos = Math.round(comparecimento * 0.025)
  const nulos = Math.round(comparecimento * 0.04)
  const validos = comparecimento - brancos - nulos

  // pesos com cauda longa: poucos candidatos concentram votos
  const pesos = r.candidatos.map((c) => Math.pow(hash(c.sqcand + r.abrangencia), 4) + 0.002)
  const soma = pesos.reduce((a, b) => a + b, 0)
  const candidatos = r.candidatos
    .map((c, i) => {
      const votos = Math.round((validos * pesos[i]) / soma)
      return { ...c, votos, percentual: validos ? (votos / validos) * 100 : 0, eleito: false, situacao: '' }
    })
    .sort((a, b) => b.votos - a.votos)

  if (progresso >= 1) {
    const vagas = Math.max(1, r.vagas)
    const segundoTurno = (r.cargo === 1 || r.cargo === 3) && candidatos[0].percentual <= 50
    candidatos.forEach((c, i) => {
      if (segundoTurno && i < 2) c.situacao = '2º turno'
      else if (!segundoTurno && i < vagas) {
        c.eleito = true
        c.situacao = 'Eleito'
      }
    })
  }

  const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)
  return {
    ...r,
    atualizadoEm: new Date().toLocaleString('pt-BR') + ' (simulado)',
    totalizacaoFinal: progresso >= 1,
    secoes: { ...r.secoes, totalizadas, percentual: pct(totalizadas, r.secoes.total) },
    eleitorado: {
      ...r.eleitorado,
      comparecimento,
      pComparecimento: pct(comparecimento, r.eleitorado.total),
      abstencao: r.eleitorado.total - comparecimento,
      pAbstencao: pct(r.eleitorado.total - comparecimento, r.eleitorado.total),
    },
    votos: {
      total: comparecimento,
      validos,
      brancos,
      pBrancos: pct(brancos, comparecimento),
      nulos,
      pNulos: pct(nulos, comparecimento),
    },
    candidatos,
  }
}
