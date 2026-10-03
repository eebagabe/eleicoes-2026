import { buscarNoticias, type Noticia } from '../api/noticias'
import { usePolling } from './usePolling'

const DOIS_MINUTOS = 120_000

export function useNoticias(busca = '') {
  return usePolling<Noticia[]>(`noticias:${busca}`, (signal) => buscarNoticias(busca, signal), DOIS_MINUTOS)
}
