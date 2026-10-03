// Cores aproximadas das identidades visuais dos partidos, usadas nas barras e destaques.
const CORES: Record<string, string> = {
  PT: '#c4161c',
  PL: '#1f3c88',
  PSD: '#f2a900',
  MDB: '#2e8b57',
  'UNIÃO': '#1d4fa3',
  PP: '#5a8ed6',
  REPUBLICANOS: '#0072bc',
  PSDB: '#0061a8',
  PSB: '#f6a400',
  PDT: '#e02d2d',
  PSOL: '#ffc600',
  REDE: '#00a99d',
  NOVO: '#f07c00',
  PODE: '#2bb24c',
  PCdoB: '#a50f15',
  'PC do B': '#a50f15',
  PV: '#2e9e3e',
  CIDADANIA: '#e4007c',
  AVANTE: '#e85d04',
  SOLIDARIEDADE: '#f37021',
  PRD: '#003f88',
  DC: '#3e8ed0',
  MISSÃO: '#6a3fb8',
  PSTU: '#b80000',
  PCO: '#8b0000',
  UP: '#d62828',
  PMB: '#c2185b',
  AGIR: '#00897b',
  MOBILIZA: '#7cb342',
  DEMOCRATA: '#1565c0',
}

const FALLBACK = ['#002776', '#009c3b', '#e6b800', '#1e4fb8', '#19c45c', '#7a5c00', '#4f6fb3', '#2f7d5b']

export function corPartido(sigla: string, indice = 0) {
  return CORES[sigla] ?? CORES[sigla.toUpperCase()] ?? FALLBACK[indice % FALLBACK.length]
}
