import type { Noticia } from '../../api/news'

export type { Noticia }

export async function buscarNoticias(busca: string, signal?: AbortSignal): Promise<Noticia[]> {
  const qs = busca.trim() ? `?q=${encodeURIComponent(busca.trim())}` : ''
  const res = await fetch(`/api/news${qs}`, { signal })
  if (!res.ok) throw new Error(`Falha ao carregar notícias (${res.status})`)
  const json = (await res.json()) as { noticias: Noticia[] }
  return json.noticias
}
