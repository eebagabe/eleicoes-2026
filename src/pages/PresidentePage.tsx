import { useState } from 'react'
import { MapaBrasil } from '../components/MapaBrasil'
import { PainelResultado } from '../components/PainelResultado'
import { UltimasNoticias } from '../components/UltimasNoticias'
import { UFS } from '../data/ufs'

export function PresidentePage() {
  const [abrangencia, setAbrangencia] = useState('br')
  const nome = abrangencia === 'br' ? 'Brasil' : UFS.find((u) => u.sigla.toLowerCase() === abrangencia)?.nome

  return (
    <>
      <h1 className="page-title">Presidente da República</h1>
      <p className="page-subtitle">Resultado {abrangencia === 'br' ? 'nacional' : `em ${nome}`} · 1º turno, 4 de outubro de 2026</p>

      <div className="filtro-abrangencia">
        <label htmlFor="abr">Ver resultado em</label>
        <select id="abr" value={abrangencia} onChange={(e) => setAbrangencia(e.target.value)}>
          <option value="br">Brasil (total)</option>
          {[...UFS]
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
            .map((u) => (
              <option key={u.sigla} value={u.sigla.toLowerCase()}>
                {u.nome}
              </option>
            ))}
        </select>
      </div>

      <div className="layout-presidente">
        <PainelResultado cargo={1} abrangencia={abrangencia} />
        <aside className="lateral">
          <MapaBrasil
            selecionada={abrangencia.toUpperCase()}
            onSelect={(sigla) => {
              const nova = sigla.toLowerCase()
              setAbrangencia(abrangencia === nova ? 'br' : nova)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
          <UltimasNoticias />
        </aside>
      </div>
    </>
  )
}
