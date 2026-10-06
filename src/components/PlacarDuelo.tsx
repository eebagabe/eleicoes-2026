import type { Candidato, Resultado } from '../api/tse'
import { coresDuelo, ladosDuelo } from '../utils/duelo'
import { formatInt, formatPct, titleCase } from '../utils/format'
import { FotoCandidato } from './FotoCandidato'

function Lado({ candidato, cor, lado, lidera }: { candidato: Candidato; cor: string; lado: 'esq' | 'dir'; lidera: boolean }) {
  const vice = candidato.vices.find((v) => v.tipo === 'v')
  return (
    <div className={`duelo-lado duelo-${lado} ${lidera ? 'duelo-lider' : ''}`}>
      <FotoCandidato src={candidato.foto} nome={candidato.nome} cor={cor} size={104} />
      <div className="duelo-nome">{titleCase(candidato.nome)}</div>
      <div className="duelo-partido">
        <span className="partido-chip">
          <i style={{ background: cor }} />
          {candidato.partido}
        </span>
        <span className="candidato-numero">{candidato.numero}</span>
      </div>
      {vice && <div className="candidato-vice">Vice: {titleCase(vice.nome)}</div>}
      <div className="duelo-pct" style={{ color: lidera ? cor : undefined }}>
        {formatPct(candidato.percentual)}
      </div>
      <div className="candidato-votos">{formatInt(candidato.votos)} votos</div>
      {candidato.eleito && <span className="tag tag-verde">✓ Eleito</span>}
    </div>
  )
}

/** Placar frente a frente para o 2º turno: dois candidatos, uma barra dividida. */
export function PlacarDuelo({ resultado }: { resultado: Resultado }) {
  const [a, b] = ladosDuelo(resultado)
  const [ca, cb] = coresDuelo([a, b])
  const apurando = a.votos + b.votos > 0
  const diferenca = Math.abs(a.votos - b.votos)
  return (
    <section className="card duelo">
      <div className="duelo-lados">
        <Lado candidato={a} cor={ca} lado="esq" lidera={apurando && a.votos >= b.votos} />
        <div className="duelo-x">×</div>
        <Lado candidato={b} cor={cb} lado="dir" lidera={apurando && b.votos > a.votos} />
      </div>
      <div className="duelo-barra" aria-hidden="true">
        {apurando ? (
          <>
            <div style={{ flex: a.votos, background: ca }} />
            <div style={{ flex: b.votos, background: cb }} />
          </>
        ) : (
          <div className="duelo-barra-vazia" />
        )}
        <span className="duelo-meio" />
      </div>
      <p className="duelo-rodape">
        {apurando
          ? `Diferença de ${formatInt(diferenca)} votos (${formatPct(Math.abs(a.percentual - b.percentual)).replace('%', ' p.p.')}) sobre os votos válidos`
          : 'Os votos aparecem aqui assim que a apuração começar.'}
      </p>
    </section>
  )
}
