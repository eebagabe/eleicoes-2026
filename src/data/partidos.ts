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

const FALLBACK = ['#24406e', '#3d8b63', '#d4a82a', '#4a6fa5', '#6b9e7f', '#8a7346', '#7d8fb3', '#5c7d6b']

/** Dessatura e clareia a cor para um visual mais calmo. */
function suavizar(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const cinza = (rgb[0] + rgb[1] + rgb[2]) / 3
  const [r, g, b] = rgb.map((c) => Math.round((c * 0.7 + cinza * 0.3) * 0.82 + 255 * 0.18))
  return `rgb(${r}, ${g}, ${b})`
}

const cache = new Map<string, string>()

export function corPartido(sigla: string, indice = 0) {
  const base = CORES[sigla] ?? CORES[sigla.toUpperCase()] ?? FALLBACK[indice % FALLBACK.length]
  let cor = cache.get(base)
  if (!cor) {
    cor = suavizar(base)
    cache.set(base, cor)
  }
  return cor
}
