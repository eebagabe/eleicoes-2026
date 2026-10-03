const intFmt = new Intl.NumberFormat('pt-BR')
const pctFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatInt = (n: number) => intFmt.format(n)
export const formatPct = (n: number) => `${pctFmt.format(n)}%`

export function titleCase(s: string) {
  const minusculas = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])
  return s
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && minusculas.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
