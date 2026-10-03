import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PainelResultado } from '../components/PainelResultado'
import { TabelaProporcional } from '../components/TabelaProporcional'
import type { CargoId } from '../config'
import { UF_BY_SIGLA, UFS } from '../data/ufs'

const ABAS: { cargo: CargoId; nome: string }[] = [
  { cargo: 3, nome: 'Governador' },
  { cargo: 5, nome: 'Senador' },
  { cargo: 6, nome: 'Dep. Federal' },
  { cargo: 7, nome: 'Dep. Estadual' },
]

const ufsOrdenadas = [...UFS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

export function EstadosPage() {
  const { uf: ufParam } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const sigla = (ufParam ?? 'SP').toUpperCase()
  const uf = UF_BY_SIGLA[sigla] ?? UF_BY_SIGLA.SP

  // DF não elege deputado estadual; elege deputado distrital (cargo 8)
  const abas = ABAS.map((a) => (uf.sigla === 'DF' && a.cargo === 7 ? { cargo: 8 as CargoId, nome: 'Dep. Distrital' } : a))
  const cargoParam = Number(params.get('cargo')) as CargoId
  const cargo = abas.some((a) => a.cargo === cargoParam) ? cargoParam : abas[0].cargo
  const abr = uf.sigla.toLowerCase()

  return (
    <>
      <h1 className="page-title">{uf.nome}</h1>
      <p className="page-subtitle">Governador, senadores e deputados · Região {uf.regiao}</p>

      <div className="filtro-abrangencia">
        <label htmlFor="uf">Estado</label>
        <select id="uf" value={uf.sigla} onChange={(e) => navigate(`/estados/${e.target.value}?${params}`)}>
          {ufsOrdenadas.map((u) => (
            <option key={u.sigla} value={u.sigla}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="abas" role="tablist">
        {abas.map((a) => (
          <button
            key={a.cargo}
            role="tab"
            aria-selected={a.cargo === cargo}
            className={a.cargo === cargo ? 'ativo' : ''}
            onClick={() => setParams({ cargo: String(a.cargo) })}
          >
            {a.nome}
          </button>
        ))}
      </div>

      {cargo === 3 || cargo === 5 ? (
        <PainelResultado key={`${abr}-${cargo}`} cargo={cargo} abrangencia={abr} />
      ) : (
        <TabelaProporcional key={`${abr}-${cargo}`} cargo={cargo} uf={abr} />
      )}
    </>
  )
}
