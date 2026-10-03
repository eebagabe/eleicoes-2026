import { useState } from 'react'
import { PainelResultado } from '../components/PainelResultado'
import { UFS } from '../data/ufs'

export function PresidentePage() {
  const [abrangencia, setAbrangencia] = useState('br')
  const nome = abrangencia === 'br' ? 'Brasil' : UFS.find((u) => u.sigla.toLowerCase() === abrangencia)?.nome

  return (
    <>
      <h1 className="page-title">Presidente da República</h1>
      <p className="page-subtitle">Resultado {abrangencia === 'br' ? 'nacional' : `em ${nome}`} — 1º turno, 4 de outubro de 2026</p>

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

      <PainelResultado cargo={1} abrangencia={abrangencia} />
    </>
  )
}
