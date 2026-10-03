import { Link } from 'react-router-dom'
import { useNoticias } from '../hooks/useNoticias'
import { NoticiaCard } from './NoticiaCard'

/** Bloco lateral com as manchetes mais recentes. */
export function UltimasNoticias({ quantidade = 6 }: { quantidade?: number }) {
  const { data } = useNoticias()
  if (!data?.length) return null
  return (
    <section className="card">
      <h3 className="secao-titulo">Últimas notícias</h3>
      <div className="noticias-lista">
        {data.slice(0, quantidade).map((n) => (
          <NoticiaCard key={n.id} noticia={n} compacta />
        ))}
      </div>
      <Link className="link-mais" to="/noticias">
        Ver todas as notícias
      </Link>
    </section>
  )
}
