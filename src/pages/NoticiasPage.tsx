import { useEffect, useState } from 'react'
import { Carregando, Erro } from '../components/Estado'
import { NoticiaCard } from '../components/NoticiaCard'
import { filtrarNoticias, TEMAS } from '../data/temas'
import { UFS } from '../data/ufs'
import { useNoticias } from '../hooks/useNoticias'

const ufsOrdenadas = [...UFS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

export function NoticiasPage() {
  const [texto, setTexto] = useState('')
  const [busca, setBusca] = useState('')
  const [tema, setTema] = useState('')
  const [uf, setUf] = useState('')

  // debounce: só consulta o servidor 500ms após parar de digitar
  useEffect(() => {
    const id = window.setTimeout(() => setBusca(texto), 500)
    return () => window.clearTimeout(id)
  }, [texto])

  const { data, error, loading, refresh } = useNoticias(busca)
  const lista = data ? filtrarNoticias(data, tema, uf) : []

  return (
    <>
      <h1 className="page-title">Últimas notícias</h1>
      <p className="page-subtitle">Cobertura das Eleições 2026 reunida do g1 e do Google Notícias, atualizada a cada 2 minutos.</p>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por candidato, cidade, assunto…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select value={uf} onChange={(e) => setUf(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos os estados</option>
          {ufsOrdenadas.map((u) => (
            <option key={u.sigla} value={u.sigla}>
              {u.nome}
            </option>
          ))}
        </select>
        <button className="btn-refresh" onClick={refresh} disabled={loading}>
          <span className={loading ? 'spin' : undefined}>↻</span> Atualizar
        </button>
      </div>

      <div className="chips">
        <button className={tema === '' ? 'ativo' : ''} onClick={() => setTema('')}>
          Todas
        </button>
        {TEMAS.map((t) => (
          <button key={t.id} className={tema === t.id ? 'ativo' : ''} onClick={() => setTema(tema === t.id ? '' : t.id)}>
            {t.nome}
          </button>
        ))}
      </div>

      {error ? (
        <Erro error={error} onRetry={refresh} />
      ) : !data ? (
        <Carregando texto="Buscando notícias…" />
      ) : lista.length === 0 ? (
        <div className="estado-msg">
          <strong>Nenhuma notícia encontrada</strong>
          <span>Tente outro tema, estado ou termo de busca.</span>
        </div>
      ) : (
        <div className="noticias-grid">
          {lista.map((n) => (
            <NoticiaCard key={n.id} noticia={n} />
          ))}
        </div>
      )}
    </>
  )
}
