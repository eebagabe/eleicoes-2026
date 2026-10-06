import type { Candidato, Resultado } from '../api/tse'
import { corPartido } from '../data/partidos'

/** Lados fixos (ordem do número na urna), para cores e posições não trocarem quando a liderança vira. */
export function ladosDuelo(r: Resultado): [Candidato, Candidato] {
  const [a, b] = [...r.candidatos].sort((x, y) => Number(x.numero) - Number(y.numero))
  return [a, b]
}

/** Cores dos dois lados do duelo; se os partidos tiverem a mesma cor, o segundo lado usa outra. */
export function coresDuelo([a, b]: Candidato[]): [string, string] {
  const ca = corPartido(a.partido, 0)
  const cb = corPartido(b.partido, 1)
  return [ca, ca === cb ? '#c9a227' : cb]
}
