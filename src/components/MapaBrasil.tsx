import { buscarResultado, type Resultado } from '../api/tse'
import { corPartido } from '../data/partidos'
import { UFS } from '../data/ufs'
import { usePolling } from '../hooks/usePolling'
import { formatPct, titleCase } from '../utils/format'

interface Props {
  selecionada?: string
  onSelect: (sigla: string) => void
}

async function buscarTodas(signal: AbortSignal) {
  const resultados = await Promise.allSettled(UFS.map((u) => buscarResultado(1, u.sigla, 1, signal)))
  const mapa: Record<string, Resultado> = {}
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') mapa[UFS[i].sigla] = r.value
  })
  return mapa
}

/** Mapa em grade (tile map) com o candidato a presidente que lidera em cada UF. */
export function MapaBrasil({ selecionada, onSelect }: Props) {
  const { data } = usePolling('mapa-presidente', buscarTodas)

  const lideres = new Map<string, { nome: string; partido: string; cor: string; pct: number; apurado: number }>()
  for (const u of UFS) {
    const r = data?.[u.sigla]
    const lider = r?.candidatos[0]
    if (r && lider && lider.votos > 0) {
      lideres.set(u.sigla, {
        nome: titleCase(lider.nome),
        partido: lider.partido,
        cor: corPartido(lider.partido),
        pct: lider.percentual,
        apurado: r.secoes.percentual,
      })
    }
  }

  const legenda = new Map<string, { nome: string; cor: string; ufs: number }>()
  for (const l of lideres.values()) {
    const item = legenda.get(l.nome) ?? { nome: `${l.nome} (${l.partido})`, cor: l.cor, ufs: 0 }
    item.ufs += 1
    legenda.set(l.nome, item)
  }

  return (
    <section className="card mapa">
      <h3 className="secao-titulo">Quem lidera em cada estado</h3>
      <div className="mapa-grid">
        {UFS.map((u) => {
          const l = lideres.get(u.sigla)
          return (
            <button
              key={u.sigla}
              className={`mapa-uf ${selecionada === u.sigla ? 'ativo' : ''}`}
              style={{ gridColumn: u.grid[0], gridRow: u.grid[1], background: l?.cor }}
              title={l ? `${u.nome}: ${l.nome} ${formatPct(l.pct)} (${formatPct(l.apurado)} apurado)` : u.nome}
              onClick={() => onSelect(u.sigla)}
            >
              <strong>{u.sigla}</strong>
              {l && <small>{Math.round(l.pct)}%</small>}
            </button>
          )
        })}
      </div>
      {legenda.size > 0 ? (
        <div className="mapa-legenda">
          {[...legenda.values()]
            .sort((a, b) => b.ufs - a.ufs)
            .map((l) => (
              <span key={l.nome}>
                <i style={{ background: l.cor }} /> {l.nome}: {l.ufs} UF{l.ufs > 1 ? 's' : ''}
              </span>
            ))}
        </div>
      ) : (
        <p className="mapa-vazio">As cores aparecem assim que os primeiros votos forem totalizados. Clique num estado para ver o resultado local.</p>
      )}
    </section>
  )
}
