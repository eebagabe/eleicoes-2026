import { Link } from 'react-router-dom'
import type { Resultado } from '../api/tse'
import { formatPct, titleCase } from '../utils/format'
import { FotoCandidato } from './FotoCandidato'
import { coresDuelo, ladosDuelo } from '../utils/duelo'

interface Props {
  resultado: Resultado
  nome: string
  to: string
}

/** Card resumido de um 2º turno estadual, para a grade de governadores. */
export function DueloCompacto({ resultado, nome, to }: Props) {
  const [a, b] = ladosDuelo(resultado)
  const cores = coresDuelo([a, b])
  const apurando = a.votos + b.votos > 0
  const eleito = resultado.candidatos.find((c) => c.eleito)
  return (
    <Link to={to} className="card duelo-mini">
      <div className="duelo-mini-topo">
        <strong>{nome}</strong>
        <span>{eleito ? 'Concluído' : apurando ? `${formatPct(resultado.secoes.percentual)} apurado` : 'Aguardando'}</span>
      </div>
      {[a, b].map((c, i) => (
        <div key={c.sqcand} className={`duelo-mini-linha ${apurando && c.votos === Math.max(a.votos, b.votos) ? 'duelo-lider' : ''}`}>
          <FotoCandidato src={c.foto} nome={c.nome} cor={cores[i]} size={40} />
          <div className="duelo-mini-info">
            <span>
              {titleCase(c.nome)} {c.eleito && <span className="tag tag-verde">✓ Eleito</span>}
            </span>
            <small>{c.partido}</small>
          </div>
          <strong>{apurando ? formatPct(c.percentual) : ''}</strong>
        </div>
      ))}
      <div className="duelo-barra duelo-barra-fina" aria-hidden="true">
        {apurando ? (
          <>
            <div style={{ flex: a.votos, background: cores[0] }} />
            <div style={{ flex: b.votos, background: cores[1] }} />
          </>
        ) : (
          <div className="duelo-barra-vazia" />
        )}
        <span className="duelo-meio" />
      </div>
    </Link>
  )
}
