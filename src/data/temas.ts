import type { Noticia } from '../api/noticias'
import { UFS } from './ufs'

export interface Tema {
  id: string
  nome: string
  termos: RegExp
}

export const TEMAS: Tema[] = [
  { id: 'presidente', nome: 'Presidente', termos: /presid|planalto|lula|bolsonaro|caiado|zema|debate/i },
  { id: 'governador', nome: 'Governadores', termos: /governad|governo d[eoa] /i },
  { id: 'senado', nome: 'Senado', termos: /senad/i },
  { id: 'camara', nome: 'Câmara e Assembleias', termos: /deputad|câmara|assembleia|bancada|distrital/i },
  { id: 'pesquisas', nome: 'Pesquisas', termos: /pesquisa|quaest|datafolha|ipec|atlas|paraná pesquisas|intenç/i },
  { id: 'apuracao', nome: 'Apuração e TSE', termos: /apura|tse|urna|totaliza|boca de urna|resultado|votaç/i },
]

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const UF_TERMOS = Object.fromEntries(
  UFS.map((u) => [u.sigla, new RegExp(`\\b(${normalizar(u.nome)}|${u.sigla.toLowerCase()})\\b`)]),
)

export function filtrarNoticias(noticias: Noticia[], tema: string, uf: string) {
  const t = TEMAS.find((x) => x.id === tema)
  return noticias.filter((n) => {
    const texto = `${n.titulo} ${n.resumo ?? ''}`
    if (t && !t.termos.test(texto)) return false
    if (uf) {
      // g1 coloca a UF na URL (g1.globo.com/rr/roraima/...)
      const naUrl = n.link.includes(`globo.com/${uf.toLowerCase()}/`)
      if (!naUrl && !UF_TERMOS[uf].test(normalizar(texto))) return false
    }
    return true
  })
}
