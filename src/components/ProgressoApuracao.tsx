import type { Resultado } from '../api/tse'
import { formatInt, formatPct } from '../utils/format'

interface Props {
  resultado: Resultado
  loading: boolean
  onRefresh: () => void
}

export function ProgressoApuracao({ resultado, loading, onRefresh }: Props) {
  const { secoes, atualizadoEm, totalizacaoFinal } = resultado
  return (
    <section className="progresso card">
      <div className="progresso-top">
        <div>
          <div className="progresso-label">Seções totalizadas</div>
          <div className="progresso-valor">{formatPct(secoes.percentual)}</div>
          <div className="progresso-sub">
            {formatInt(secoes.totalizadas)} de {formatInt(secoes.total)} seções
          </div>
        </div>
        <div className="progresso-meta">
          {totalizacaoFinal ? (
            <span className="tag tag-verde">Totalização concluída</span>
          ) : secoes.totalizadas === 0 ? (
            <span className="tag tag-amarelo">Aguardando início da apuração</span>
          ) : (
            <span className="tag tag-azul">Apuração em andamento</span>
          )}
          <div className="progresso-sub">Atualizado pelo TSE em {atualizadoEm}</div>
          <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
            <span className={loading ? 'spin' : undefined}>↻</span> {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
      </div>
      <div className="barra-progresso" role="progressbar" aria-valuenow={secoes.percentual} aria-valuemin={0} aria-valuemax={100}>
        <div className="barra-progresso-fill" style={{ width: `${secoes.percentual}%` }} />
      </div>
    </section>
  )
}
