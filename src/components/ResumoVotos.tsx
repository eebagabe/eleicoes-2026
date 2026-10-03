import type { Resultado } from '../api/tse'
import { formatInt, formatPct } from '../utils/format'

export function ResumoVotos({ resultado }: { resultado: Resultado }) {
  const { votos, eleitorado } = resultado
  const itens = [
    { label: 'Eleitorado', valor: formatInt(eleitorado.total) },
    { label: 'Comparecimento', valor: formatInt(eleitorado.comparecimento), pct: eleitorado.pComparecimento },
    { label: 'Abstenção', valor: formatInt(eleitorado.abstencao), pct: eleitorado.pAbstencao },
    { label: 'Votos válidos', valor: formatInt(votos.validos) },
    { label: 'Brancos', valor: formatInt(votos.brancos), pct: votos.pBrancos },
    { label: 'Nulos', valor: formatInt(votos.nulos), pct: votos.pNulos },
  ]
  return (
    <section className="resumo">
      {itens.map((i) => (
        <div className="resumo-item" key={i.label}>
          <div className="resumo-label">{i.label}</div>
          <div className="resumo-valor">{i.valor}</div>
          {i.pct !== undefined && <div className="resumo-pct">{formatPct(i.pct)}</div>}
        </div>
      ))}
    </section>
  )
}
