import { simular } from './simulacao'
import { CARGOS, CICLO, ELEICOES, TSE_BASE, type CargoId, type Turno } from '../config'

/* ---------- Formato bruto do TSE (arquivo "-u.json") ---------- */

interface RawVice {
  tp: string // "v" vice, "s1"/"s2" suplentes
  sqcand: string
  nm: string
  nmu: string
  sgp: string
}

interface RawCandidato {
  n: string
  sqcand: string
  nm: string
  nmu: string
  dt: string
  seq: string
  e: 's' | 'n'
  st: string
  vap: string
  pvap: string
  vs?: RawVice[]
}

interface RawPartido {
  n: string
  sg: string
  nm: string
  nfed: string
  cand: RawCandidato[]
}

interface RawAgremiacao {
  n: string
  nm: string
  tp: 'c' | 'i' | 'f' // coligação, isolado, federação
  com: string
  par: RawPartido[]
}

interface RawCargo {
  cd: string
  nmn: string
  nv: string
  agr: RawAgremiacao[]
}

interface RawResultado {
  ele: string
  t: string
  tpabr: string
  cdabr: string
  dg: string
  hg: string
  tf: 's' | 'n'
  carg: RawCargo[]
  s: { ts: string; st: string; pst: string }
  e: { te: string; c: string; pc: string; a: string; pa: string }
  v: { tv: string; vv: string; pvv: string; vb: string; pvb: string; tvn: string; ptvn: string }
}

/* ---------- Modelo normalizado ---------- */

export interface Candidato {
  sqcand: string
  numero: string
  nome: string
  nomeCompleto: string
  partido: string
  coligacao: string
  votos: number
  percentual: number
  eleito: boolean
  situacao: string
  vices: { nome: string; partido: string; tipo: string }[]
  foto: string
}

export interface Resultado {
  cargo: CargoId
  cargoNome: string
  abrangencia: string // "br" ou sigla UF minúscula
  vagas: number
  atualizadoEm: string
  totalizacaoFinal: boolean
  secoes: { total: number; totalizadas: number; percentual: number }
  eleitorado: { total: number; comparecimento: number; pComparecimento: number; abstencao: number; pAbstencao: number }
  votos: { total: number; validos: number; brancos: number; pBrancos: number; nulos: number; pNulos: number }
  candidatos: Candidato[]
}

const num = (s: string | undefined) => (s ? Number(s) : 0)
const pct = (s: string | undefined) => (s ? Number(s.replace(',', '.')) : 0)

function eleicaoCodigo(cargo: CargoId, turno: Turno) {
  return ELEICOES[CARGOS[cargo].eleicao][turno]
}

export function resultadoUrl(cargo: CargoId, abrangencia: string, turno: Turno = 1) {
  const ele = eleicaoCodigo(cargo, turno)
  const abr = abrangencia.toLowerCase()
  const c = String(cargo).padStart(4, '0')
  const e = ele.padStart(6, '0')
  return `${TSE_BASE}/${CICLO}/${ele}/dados/${abr}/${abr}-c${c}-e${e}-u.json`
}

export function fotoUrl(cargo: CargoId, abrangencia: string, sqcand: string, turno: Turno = 1) {
  const ele = eleicaoCodigo(cargo, turno)
  return `${TSE_BASE}/${CICLO}/${ele}/fotos/${abrangencia.toLowerCase()}/${sqcand}.jpeg`
}

export function normalizar(raw: RawResultado, cargo: CargoId, turno: Turno): Resultado {
  const c = raw.carg.find((x) => Number(x.cd) === cargo) ?? raw.carg[0]
  const candidatos: Candidato[] = []
  for (const agr of c.agr) {
    const coligacao = agr.tp === 'c' ? agr.nm : ''
    for (const par of agr.par) {
      for (const cand of par.cand) {
        candidatos.push({
          sqcand: cand.sqcand,
          numero: cand.n,
          nome: cand.nmu,
          nomeCompleto: cand.nm,
          partido: par.sg,
          coligacao,
          votos: num(cand.vap),
          percentual: pct(cand.pvap),
          eleito: cand.e === 's',
          situacao: cand.st,
          vices: (cand.vs ?? []).map((v) => ({ nome: v.nmu, partido: v.sgp, tipo: v.tp })),
          foto: fotoUrl(cargo, raw.cdabr, cand.sqcand, turno),
        })
      }
    }
  }
  candidatos.sort((a, b) => b.votos - a.votos || a.nome.localeCompare(b.nome, 'pt-BR'))

  return {
    cargo,
    cargoNome: c.nmn,
    abrangencia: raw.cdabr,
    vagas: num(c.nv),
    atualizadoEm: `${raw.dg} ${raw.hg}`,
    totalizacaoFinal: raw.tf === 's',
    secoes: { total: num(raw.s.ts), totalizadas: num(raw.s.st), percentual: pct(raw.s.pst) },
    eleitorado: {
      total: num(raw.e.te),
      comparecimento: num(raw.e.c),
      pComparecimento: pct(raw.e.pc),
      abstencao: num(raw.e.a),
      pAbstencao: pct(raw.e.pa),
    },
    votos: {
      total: num(raw.v.tv),
      validos: num(raw.v.vv),
      brancos: num(raw.v.vb),
      pBrancos: pct(raw.v.pvb),
      nulos: num(raw.v.tvn),
      pNulos: pct(raw.v.ptvn),
    },
    candidatos,
  }
}

export class NaoDisponivelError extends Error {}

export async function buscarResultado(
  cargo: CargoId,
  abrangencia: string,
  turno: Turno = 1,
  signal?: AbortSignal,
): Promise<Resultado> {
  const res = await fetch(resultadoUrl(cargo, abrangencia, turno), { signal, cache: 'no-store' })
  if (res.status === 404 || res.status === 403) {
    throw new NaoDisponivelError('Resultado ainda não disponível para esta consulta.')
  }
  if (!res.ok) throw new Error(`TSE respondeu ${res.status}`)
  const raw = (await res.json()) as RawResultado
  return simular(normalizar(raw, cargo, turno))
}
