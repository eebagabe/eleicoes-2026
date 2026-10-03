// Função serverless (Vercel) que agrega notícias de RSS públicos e devolve JSON.
// Necessária porque os feeds RSS não enviam cabeçalhos CORS para o navegador.

export interface Noticia {
  id: string
  titulo: string
  link: string
  fonte: string
  publicadoEm: string
  resumo?: string
  imagem?: string
}

const GOOGLE_NEWS = (q: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`

const FEEDS_FIXOS = [{ url: 'https://g1.globo.com/rss/g1/politica/', fonte: 'g1' }]

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .trim()

const tag = (xml: string, nome: string) => {
  const m = xml.match(new RegExp(`<${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</${nome}>`))
  return m ? decode(m[1]) : undefined
}

const semHtml = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

export function parseRss(xml: string, fontePadrao: string): Noticia[] {
  const itens = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return itens.flatMap((item) => {
    let titulo = tag(item, 'title')
    const link = tag(item, 'link')
    if (!titulo || !link) return []
    const fonte = tag(item, 'source') ?? fontePadrao
    // Google Notícias acrescenta " - Fonte" ao título
    if (titulo.endsWith(` - ${fonte}`)) titulo = titulo.slice(0, -fonte.length - 3)
    const descricao = tag(item, 'description') ?? ''
    const imagem =
      item.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ?? descricao.match(/<img[^>]*src="([^"]+)"/)?.[1]
    const resumo = semHtml(tag(item, 'atom:subtitle') ?? descricao)
    const data = new Date(tag(item, 'pubDate') ?? Date.now())
    return [
      {
        id: tag(item, 'guid') ?? link,
        titulo: semHtml(titulo),
        link,
        fonte,
        publicadoEm: (isNaN(data.getTime()) ? new Date() : data).toISOString(),
        // resumo do Google Notícias só repete o título
        resumo: fontePadrao === 'Google Notícias' || !resumo ? undefined : resumo.slice(0, 280),
        imagem: imagem?.replace(/&amp;/g, '&'),
      },
    ]
  })
}

async function lerFeed(url: string, fonte: string): Promise<Noticia[]> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; ApuracaoAoVivo/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    return parseRss(await res.text(), fonte)
  } catch {
    return []
  }
}

export async function buscarNoticias(busca?: string): Promise<Noticia[]> {
  const termo = ['eleições 2026', busca?.trim()].filter(Boolean).join(' ')
  const listas = await Promise.all([
    lerFeed(GOOGLE_NEWS(`${termo} when:2d`), 'Google Notícias'),
    ...(busca ? [] : FEEDS_FIXOS.map((f) => lerFeed(f.url, f.fonte))),
  ])
  const vistos = new Set<string>()
  return listas
    .flat()
    .filter((n) => {
      const chave = n.titulo.toLowerCase()
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
    .slice(0, 80)
}

export async function GET(request: Request): Promise<Response> {
  const q = new URL(request.url).searchParams.get('q')?.slice(0, 80) ?? undefined
  const noticias = await buscarNoticias(q)
  return Response.json(
    { atualizadoEm: new Date().toISOString(), noticias },
    { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=300' } },
  )
}
