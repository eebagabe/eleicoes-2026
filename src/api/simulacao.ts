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
  // mistura final (murmur3): strings quase iguais ("...|0", "...|1") geram valores independentes
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

const LOTES = 100
const FASES = 4 // força de cada candidato muda ao longo da apuração (início, meio, fim...)

/**
 * A apuração chega em lotes; em cada lote a força de cada candidato é interpolada entre
 * fases sorteadas, sem relação com partido ou pesquisa. Qualquer um pode vencer e o líder
 * pode mudar no meio do caminho. Os votos são a soma dos lotes, então nunca diminuem.
 */
function acumular(r: Resultado, semente: string, progresso: number): number[] {
  // cauda longa: em cada fase poucos candidatos concentram os votos; num duelo a disputa fica apertada
  const duelo = r.candidatos.length <= 2
  const forca = (h: number) => (duelo ? 1 + h * 0.5 : Math.pow(h, 4) + 0.002)
  const fases = r.candidatos.map((c) =>
    Array.from({ length: FASES }, (_, f) => forca(hash(`${semente}|${c.sqcand}|${r.abrangencia}|${r.turno}|${f}`))),
  )
  const acumulado = new Array<number>(r.candidatos.length).fill(0)
  const lotes = progresso * LOTES
  for (let l = 0; l < Math.ceil(lotes); l++) {
    const fracao = Math.min(1, lotes - l)
    const pos = ((l + 0.5) / LOTES) * (FASES - 1)
    const f = Math.min(FASES - 2, Math.floor(pos))
    const t = pos - f
    const forcas = fases.map((p) => p[f] * (1 - t) + p[f + 1] * t)
    const total = forcas.reduce((a, b) => a + b, 0)
    forcas.forEach((v, i) => (acumulado[i] += (fracao * v) / total))
  }
  return acumulado
}

export function simular(r: Resultado): Resultado {
  const inicio = lerInicio()
  if (inicio === null) return r
  // o instante de ativação serve de semente: cada usuário (e cada ativação) vê um cenário diferente
  const semente = String(inicio)
  // cada abrangência avança num ritmo levemente diferente
  const ritmo = 0.75 + hash(semente + r.abrangencia) * 0.5
  const progresso = Math.min(1, ((Date.now() - inicio) / DURACAO_MS) * ritmo)
  const totalizadas = Math.round(r.secoes.total * progresso)
  const comparecimento = Math.round(r.eleitorado.total * 0.79 * progresso)
  const brancos = Math.round(comparecimento * 0.025)
  const nulos = Math.round(comparecimento * 0.04)
  const validos = comparecimento - brancos - nulos

  const votosAcumulados = acumular(r, semente, progresso)
  const soma = votosAcumulados.reduce((a, b) => a + b, 0)
  const candidatos = r.candidatos
    .map((c, i) => {
      const votos = soma ? Math.round((validos * votosAcumulados[i]) / soma) : 0
      return { ...c, votos, percentual: validos ? (votos / validos) * 100 : 0, eleito: false, situacao: '' }
    })
    .sort((a, b) => b.votos - a.votos)

  if (progresso >= 1) {
    const vagas = Math.max(1, r.vagas)
    const segundoTurno = r.turno === 1 && (r.cargo === 1 || r.cargo === 3) && candidatos[0].percentual <= 50
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
