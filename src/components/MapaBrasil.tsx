import { buscarResultado, type Resultado } from '../api/tse'
import type { Turno } from '../config'
import { corPartido } from '../data/partidos'
import { UFS } from '../data/ufs'
import { usePolling } from '../hooks/usePolling'
import { formatPct, titleCase } from '../utils/format'

interface Props {
  turno?: Turno
  selecionada?: string
  onSelect: (sigla: string) => void
}

async function buscarTodas(turno: Turno, signal: AbortSignal) {
  const resultados = await Promise.allSettled(UFS.map((u) => buscarResultado(1, u.sigla, turno, signal)))
  const mapa: Record<string, Resultado> = {}
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') mapa[UFS[i].sigla] = r.value
  })
  return mapa
}

/** Mapa em grade (tile map) com o candidato a presidente que lidera em cada UF. */
export function MapaBrasil({ turno = 1, selecionada, onSelect }: Props) {
  const { data } = usePolling(`mapa-presidente-${turno}`, (signal) => buscarTodas(turno, signal))
  // 1º turno só serve de base para as viradas; muda pouco, então atualiza devagar
  const { data: primeiro } = usePolling(
    `mapa-presidente-1${turno === 1 ? '-off' : ''}`,
    async (signal) => (turno === 2 ? buscarTodas(1, signal) : ({} as Record<string, Resultado>)),
    5 * 60_000,
  )

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

  // soma votos e seções das UFs de cada região
  const regioes = (['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'] as const).map((nome) => {
    let secoes = 0
    let totalizadas = 0
    let validos = 0
    const votos = new Map<string, { nome: string; partido: string; votos: number }>()
    for (const u of UFS) {
      const r = data?.[u.sigla]
      if (u.regiao !== nome || !r) continue
      secoes += r.secoes.total
      totalizadas += r.secoes.totalizadas
      validos += r.votos.validos
      for (const c of r.candidatos) {
        const item = votos.get(c.nome) ?? { nome: c.nome, partido: c.partido, votos: 0 }
        item.votos += c.votos
        votos.set(c.nome, item)
      }
    }
    const lider = [...votos.values()].sort((a, b) => b.votos - a.votos)[0]
    return {
      nome,
      apurado: secoes ? (totalizadas / secoes) * 100 : 0,
      lider: lider && lider.votos > 0 ? { ...lider, pct: (lider.votos / validos) * 100 } : undefined,
    }
  })

  const viradas = UFS.flatMap((u) => {
    const r2 = data?.[u.sigla]
    const v1 = primeiro?.[u.sigla]?.candidatos[0]
    const [a, b] = r2?.candidatos ?? []
    if (turno !== 2 || !r2 || !v1 || !a || a.votos === 0 || a.nome === v1.nome) return []
    return [{ uf: u, antes: v1, agora: a, vantagem: a.percentual - (b?.percentual ?? 0), apurado: r2.secoes.percentual }]
  }).sort((x, y) => y.vantagem - x.vantagem)

  const legenda = new Map<string, { nome: string; cor: string; ufs: number }>()
  for (const l of lideres.values()) {
    const item = legenda.get(l.nome) ?? { nome: `${l.nome} (${l.partido})`, cor: l.cor, ufs: 0 }
    item.ufs += 1
    legenda.set(l.nome, item)
  }

  return (
    <>
      <section className="card mapa">
        <h3 className="secao-titulo">Quem lidera em cada estado</h3>
        <div className="mapa-grid">
          {UFS.map((u) => {
            const l = lideres.get(u.sigla)
            const r = data?.[u.sigla]
            return (
              <button
                key={u.sigla}
                className={`mapa-uf ${selecionada === u.sigla ? 'ativo' : ''}`}
                style={{ gridColumn: u.grid[0], gridRow: u.grid[1], background: l?.cor }}
                title={l ? `${u.nome}: ${l.nome} ${formatPct(l.pct)} (${formatPct(l.apurado)} apurado)` : u.nome}
                onClick={() => onSelect(u.sigla)}
              >
                <strong>{u.sigla}</strong>
                {l && <span>{Math.round(l.pct)}%</span>}
                {r && <small>{Math.round(r.secoes.percentual)}% apur.</small>}
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
          <p className="mapa-vazio">
            As cores aparecem assim que os primeiros votos forem totalizados. Clique num estado para ver o resultado local.
          </p>
        )}
      </section>
      <section className="card regioes">
        <h3 className="secao-titulo">Apuração por região</h3>
        <ul>
          {regioes.map((g) => (
            <li key={g.nome}>
              <strong>{g.nome}</strong>
              <span className="regiao-lider">
                {g.lider ? (
                  <>
                    <b style={{ color: corPartido(g.lider.partido) }}>{titleCase(g.lider.nome)}</b> {formatPct(g.lider.pct)}
                  </>
                ) : (
                  'Sem votos ainda'
                )}
              </span>
              <span className="regiao-barra" title={`${formatPct(g.apurado)} apurado`}>
                <i style={{ width: `${g.apurado}%` }} />
              </span>
              <small>{formatPct(g.apurado)} apurado</small>
            </li>
          ))}
        </ul>
      </section>
      {turno === 2 && (
        <section className="card viradas">
          <h3 className="secao-titulo">Estados que viraram</h3>
          {viradas.length === 0 ? (
            <p className="mapa-vazio">Nenhum estado com líder diferente do vencedor do 1º turno até agora.</p>
          ) : (
            <ol>
              {viradas.map((v) => (
                <li key={v.uf.sigla}>
                  <button onClick={() => onSelect(v.uf.sigla)}>
                    <strong>{v.uf.nome}</strong>
                    <span>
                      1º turno: <b style={{ color: corPartido(v.antes.partido) }}>{titleCase(v.antes.nome)}</b>{' '}
                      {formatPct(v.antes.percentual)}
                    </span>
                    <span>
                      Agora: <b style={{ color: corPartido(v.agora.partido) }}>{titleCase(v.agora.nome)}</b>{' '}
                      {formatPct(v.agora.percentual)} (+
                      {formatPct(v.vantagem)} de vantagem, {formatPct(v.apurado)} apurado)
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </>
  )
}
