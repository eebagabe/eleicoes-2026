import type { Noticia } from '../api/noticias'

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function tempoRelativo(iso: string) {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffH = Math.round(diffMin / 60)
  if (Math.abs(diffH) < 24) return rtf.format(diffH, 'hour')
  return rtf.format(Math.round(diffH / 24), 'day')
}

export function NoticiaCard({ noticia, compacta }: { noticia: Noticia; compacta?: boolean }) {
  return (
    <a className={`noticia ${compacta ? 'noticia-compacta' : ''}`} href={noticia.link} target="_blank" rel="noreferrer">
      {!compacta && noticia.imagem && <img className="noticia-img" src={noticia.imagem} alt="" loading="lazy" />}
      <div className="noticia-corpo">
        <div className="noticia-meta">
          <span className="noticia-fonte">{noticia.fonte}</span>
          <span>{tempoRelativo(noticia.publicadoEm)}</span>
        </div>
        <h3 className="noticia-titulo">{noticia.titulo}</h3>
        {!compacta && noticia.resumo && <p className="noticia-resumo">{noticia.resumo}</p>}
      </div>
    </a>
  )
}
