// Códigos oficiais das eleições 2026 (fonte: resultados.tse.jus.br/oficial/comum/config/ele-c.json)
export const TSE_BASE = 'https://resultados.tse.jus.br/oficial'
export const CICLO = 'ele2026'

export type Turno = 1 | 2

export const ELEICOES = {
  federal: { 1: '6257', 2: '6258' },
  estadual: { 1: '6259', 2: '6260' },
} as const

export const POLL_INTERVAL_MS = 30_000

export type CargoId = 1 | 3 | 5 | 6 | 7 | 8

export const CARGOS: Record<CargoId, { nome: string; eleicao: keyof typeof ELEICOES }> = {
  1: { nome: 'Presidente', eleicao: 'federal' },
  3: { nome: 'Governador', eleicao: 'estadual' },
  5: { nome: 'Senador', eleicao: 'estadual' },
  6: { nome: 'Deputado Federal', eleicao: 'estadual' },
  7: { nome: 'Deputado Estadual', eleicao: 'estadual' },
  8: { nome: 'Deputado Distrital', eleicao: 'estadual' },
}
