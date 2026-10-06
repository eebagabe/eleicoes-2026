import { Link, useNavigate, useParams } from 'react-router-dom'
import { buscarResultado, type Resultado } from '../api/tse'
import { Carregando } from '../components/Estado'
import { DueloCompacto } from '../components/DueloCompacto'
import { PainelResultado } from '../components/PainelResultado'
import { UF_BY_SIGLA, UFS } from '../data/ufs'
import { usePolling } from '../hooks/usePolling'

/** Busca o governador em todas as UFs; só ficam as que têm 2º turno. */
async function buscarSegundoTurno(signal: AbortSignal) {
  const resultados = await Promise.allSettled(UFS.map((u) => buscarResultado(3, u.sigla, 2, signal)))
  const duelos: { sigla: string; nome: string; resultado: Resultado }[] = []
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.candidatos.length === 2) {
      duelos.push({ sigla: UFS[i].sigla, nome: UFS[i].nome, resultado: r.value })
    }
  })
  return duelos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function GovernadoresPage() {
  const { uf: ufParam } = useParams()
  const navigate = useNavigate()
  const { data: duelos } = usePolling('governadores-2t', buscarSegundoTurno)
  const uf = ufParam ? UF_BY_SIGLA[ufParam.toUpperCase()] : undefined

  if (uf) {
    return (
      <>
        <h1 className="page-title">Governador · {uf.nome}</h1>
        <p className="page-subtitle">2º turno, 25 de outubro de 2026</p>
        <div className="filtro-abrangencia">
          <Link to="/governadores" className="voltar">
            ← Todos os estados
          </Link>
          {duelos && duelos.length > 0 && (
            <select aria-label="Estado" value={uf.sigla} onChange={(e) => navigate(`/governadores/${e.target.value}`)}>
              {!duelos.some((d) => d.sigla === uf.sigla) && <option value={uf.sigla}>{uf.nome}</option>}
              {duelos.map((d) => (
                <option key={d.sigla} value={d.sigla}>
                  {d.nome}
                </option>
              ))}
            </select>
          )}
        </div>
        <PainelResultado key={uf.sigla} cargo={3} abrangencia={uf.sigla.toLowerCase()} turno={2} />
      </>
    )
  }

  return (
    <>
      <h1 className="page-title">Governadores</h1>
      <p className="page-subtitle">
        2º turno, 25 de outubro de 2026
        {duelos && ` · ${duelos.length} ${duelos.length === 1 ? 'estado' : 'estados'} em disputa`}
      </p>
      {!duelos ? (
        <Carregando texto="Carregando disputas…" />
      ) : duelos.length === 0 ? (
        <p className="estado-msg">Nenhum estado tem 2º turno para governador.</p>
      ) : (
        <div className="grade-duelos">
          {duelos.map((d) => (
            <DueloCompacto key={d.sigla} resultado={d.resultado} nome={d.nome} to={`/governadores/${d.sigla}`} />
          ))}
        </div>
      )}
      <p className="nota-rodape">
        Os demais estados elegeram governador no 1º turno. Veja em <Link to="/1-turno/estados">1º turno › Estados</Link>.
      </p>
    </>
  )
}
