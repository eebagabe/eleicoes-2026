import type { CargoId, Turno } from '../config'
import { useResultado } from '../hooks/useResultado'
import { CandidatoCard } from './CandidatoCard'
import { Carregando, Erro } from './Estado'
import { PlacarDuelo } from './PlacarDuelo'
import { ProgressoApuracao } from './ProgressoApuracao'
import { ResumoVotos } from './ResumoVotos'

interface Props {
  cargo: CargoId
  abrangencia: string
  turno?: Turno
}

/** Painel completo para cargos majoritários (presidente, governador, senador); no 2º turno mostra o duelo. */
export function PainelResultado({ cargo, abrangencia, turno = 1 }: Props) {
  const { data, error, loading, refresh } = useResultado(cargo, abrangencia, turno)

  if (error) return <Erro error={error} onRetry={refresh} />
  if (!data) return <Carregando />

  const apurando = data.secoes.totalizadas > 0
  return (
    <div className="painel">
      <ProgressoApuracao resultado={data} loading={loading} onRefresh={refresh} />
      {data.vagas > 1 && (
        <p className="aviso-vagas">
          {data.vagas} vagas em disputa. Os {data.vagas} mais votados são eleitos.
        </p>
      )}
      {data.turno === 2 && data.candidatos.length === 2 ? (
        <PlacarDuelo resultado={data} />
      ) : (
        <div className="lista-candidatos">
          {data.candidatos.map((c, i) => (
            <CandidatoCard key={c.sqcand} candidato={c} posicao={i} destaque={apurando && i < Math.max(1, data.vagas)} />
          ))}
        </div>
      )}
      <ResumoVotos resultado={data} />
    </div>
  )
}
