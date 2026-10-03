import type { Candidato } from '../api/tse'
import { corPartido } from '../data/partidos'
import { formatInt, formatPct, titleCase } from '../utils/format'
import { FotoCandidato } from './FotoCandidato'

interface Props {
  candidato: Candidato
  posicao: number
  destaque?: boolean
}

function Situacao({ candidato }: { candidato: Candidato }) {
  if (candidato.eleito) return <span className="tag tag-verde">✓ Eleito</span>
  if (/2º turno/i.test(candidato.situacao)) return <span className="tag tag-amarelo">2º turno</span>
  if (candidato.situacao) return <span className="tag">{candidato.situacao}</span>
  return null
}

export function CandidatoCard({ candidato, posicao, destaque }: Props) {
  const cor = corPartido(candidato.partido, posicao)
  const vice = candidato.vices.find((v) => v.tipo === 'v')
  return (
    <article className={`candidato ${destaque ? 'candidato-destaque' : ''}`}>
      <div className="candidato-posicao">{posicao + 1}º</div>
      <FotoCandidato src={candidato.foto} nome={candidato.nome} cor={cor} size={destaque ? 88 : 64} />
      <div className="candidato-info">
        <div className="candidato-nome-linha">
          <h3 className="candidato-nome">{titleCase(candidato.nome)}</h3>
          <Situacao candidato={candidato} />
        </div>
        <div className="candidato-partido">
          <span className="partido-chip" style={{ background: cor }}>
            {candidato.partido}
          </span>
          <span className="candidato-numero">{candidato.numero}</span>
          {vice && <span className="candidato-vice">Vice: {titleCase(vice.nome)}</span>}
        </div>
        <div className="barra-voto">
          <div className="barra-voto-fill" style={{ width: `${candidato.percentual}%`, background: cor }} />
        </div>
      </div>
      <div className="candidato-numeros">
        <div className="candidato-pct">{formatPct(candidato.percentual)}</div>
        <div className="candidato-votos">{formatInt(candidato.votos)} votos</div>
      </div>
    </article>
  )
}
