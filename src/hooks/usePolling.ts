import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { simulacaoAtiva } from '../api/simulacao'
import { POLL_INTERVAL_MS, POLL_INTERVAL_SIMULACAO_MS } from '../config'

const INTERVALO_PADRAO = simulacaoAtiva() ? POLL_INTERVAL_SIMULACAO_MS : POLL_INTERVAL_MS

export interface PollingState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
  lastFetch: Date | undefined
  refresh: () => void
}

/**
 * Executa `fetcher` imediatamente e a cada `interval` ms enquanto a aba estiver visível.
 * Troca de `key` reinicia o ciclo e descarta dados antigos.
 */
export function usePolling<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  interval = INTERVALO_PADRAO,
): PollingState<T> {
  const [state, setState] = useState<{ key: string; tick?: number; data?: T; error?: Error; lastFetch?: Date }>({
    key,
  })
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)
  useLayoutEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const ctrl = new AbortController()
    fetcherRef
      .current(ctrl.signal)
      .then((data) => setState({ key, tick, data, lastFetch: new Date() }))
      .catch((error: Error) => {
        if (ctrl.signal.aborted) return
        // mantém último dado válido da mesma chave em caso de falha transitória
        setState((prev) => ({ ...(prev.key === key ? prev : { key }), tick, error, lastFetch: new Date() }))
      })
    return () => ctrl.abort()
  }, [key, tick])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, interval)
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [interval, refresh, key])

  const current = state.key === key ? state : { key, tick: undefined }
  return {
    data: current.data,
    error: current.data ? undefined : current.error,
    loading: current.tick !== tick,
    lastFetch: current.lastFetch,
    refresh,
  }
}
