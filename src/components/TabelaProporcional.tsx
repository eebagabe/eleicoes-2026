import { useMemo, useState } from 'react'
import type { CargoId } from '../config'
import { corPartido } from '../data/partidos'
import { useResultado } from '../hooks/useResultado'
import { formatInt, formatPct, titleCase } from '../utils/format'
import { Carregando, Erro } from './Estado'
import { FotoCandidato } from './FotoCandidato'
import { ProgressoApuracao } from './ProgressoApuracao'

const PAGINA = 30

interface Props {
  cargo: CargoId
  uf: string
}

/** Lista para cargos proporcionais (deputados), com busca, filtro por partido e bancada eleita. */
export function TabelaProporcional({ cargo, uf }: Props) {
  const { data, error, loading, refresh } = useResultado(cargo, uf)
  const [busca, setBusca] = useState('')
  const [partido, setPartido] = useState('')
  const [soEleitos, setSoEleitos] = useState(false)
  const [limite, setLimite] = useState(PAGINA)

  const partidos = useMemo(() => {
    if (!data) return []
    const mapa = new Map<string, { votos: number; eleitos: number; candidatos: number }>()
    for (const c of data.candidatos) {
      const p = mapa.get(c.partido) ?? { votos: 0, eleitos: 0, candidatos: 0 }
      p.votos += c.votos
      p.candidatos += 1
      if (c.eleito) p.eleitos += 1
      mapa.set(c.partido, p)
    }
    return [...mapa.entries()]
      .map(([sigla, v]) => ({ sigla, ...v }))
      .sort((a, b) => b.eleitos - a.eleitos || b.votos - a.votos || a.sigla.localeCompare(b.sigla))
  }, [data])

  const filtrados = useMemo(() => {
    if (!data) return []
    const q = busca
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
    return data.candidatos.filter((c) => {
      if (partido && c.partido !== partido) return false
      if (soEleitos && !c.eleito) return false
      if (!q) return true
      const alvo = `${c.nome} ${c.nomeCompleto} ${c.numero}`
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
      return alvo.includes(q)
    })
  }, [data, busca, partido, soEleitos])

  if (error) return <Erro error={error} onRetry={refresh} />
  if (!data) return <Carregando />

  const totalEleitos = partidos.reduce((s, p) => s + p.eleitos, 0)
  const rank = new Map(data.candidatos.map((c, i) => [c.sqcand, i + 1]))

  return (
    <div className="painel">
      <ProgressoApuracao resultado={data} loading={loading} onRefresh={refresh} />

      <section className="card">
        <h3 className="secao-titulo">
          Bancada {totalEleitos > 0 ? 'eleita' : 'por partido'} <small>{data.vagas} vagas</small>
        </h3>
        {totalEleitos > 0 && (
          <div className="bancada-barra">
            {partidos
              .filter((p) => p.eleitos > 0)
              .map((p, i) => (
                <div
                  key={p.sigla}
                  title={`${p.sigla}: ${p.eleitos}`}
                  style={{ flex: p.eleitos, background: corPartido(p.sigla, i) }}
                />
              ))}
          </div>
        )}
        <div className="bancada-lista">
          {partidos.map((p, i) => (
            <button
              key={p.sigla}
              className={`bancada-item ${partido === p.sigla ? 'ativo' : ''}`}
              onClick={() => {
                setPartido(partido === p.sigla ? '' : p.sigla)
                setLimite(PAGINA)
              }}
            >
              <span className="partido-chip" style={{ background: corPartido(p.sigla, i) }}>
                {p.sigla}
              </span>
              <strong>{totalEleitos > 0 ? p.eleitos : p.candidatos}</strong>
              <small>{totalEleitos > 0 ? 'eleitos' : 'candidatos'}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar candidato por nome ou número…"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setLimite(PAGINA)
          }}
        />
        <label className="check">
          <input type="checkbox" checked={soEleitos} onChange={(e) => setSoEleitos(e.target.checked)} /> Somente eleitos
        </label>
        <span className="filtros-total">{formatInt(filtrados.length)} candidatos</span>
      </div>

      <div className="tabela">
        {filtrados.slice(0, limite).map((c) => {
          const cor = corPartido(c.partido)
          return (
            <div className={`linha ${c.eleito ? 'linha-eleito' : ''}`} key={c.sqcand}>
              <span className="linha-pos">{c.votos > 0 ? `${rank.get(c.sqcand)}º` : ''}</span>
              <FotoCandidato src={c.foto} nome={c.nome} cor={cor} size={44} />
              <div className="linha-info">
                <strong>{titleCase(c.nome)}</strong>
                <span>
                  <span className="partido-chip" style={{ background: cor }}>
                    {c.partido}
                  </span>{' '}
                  {c.numero}
                  {c.situacao && <em> · {c.situacao}</em>}
                </span>
              </div>
              <div className="linha-num">
                <strong>{formatInt(c.votos)}</strong>
                <span>{formatPct(c.percentual)}</span>
              </div>
            </div>
          )
        })}
      </div>
      {filtrados.length > limite && (
        <button className="btn-mais" onClick={() => setLimite((l) => l + PAGINA * 2)}>
          Mostrar mais ({formatInt(filtrados.length - limite)} restantes)
        </button>
      )}
    </div>
  )
}
