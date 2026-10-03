import { useCallback, useEffect, useRef, useState } from 'react'
import { POLL_INTERVAL_MS } from '../config'

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
  interval = POLL_INTERVAL_MS,
): PollingState<T> {
  const [state, setState] = useState<{ key: string; data?: T; error?: Error; lastFetch?: Date }>({ key })
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    fetcherRef
      .current(ctrl.signal)
      .then((data) => setState({ key, data, lastFetch: new Date() }))
      .catch((error: Error) => {
        if (ctrl.signal.aborted) return
        // mantém último dado válido da mesma chave em caso de falha transitória
        setState((prev) => ({ ...(prev.key === key ? prev : { key }), error, lastFetch: new Date() }))
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
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

  const current = state.key === key ? state : { key }
  return {
    data: current.data,
    error: current.data ? undefined : current.error,
    loading,
    lastFetch: current.lastFetch,
    refresh,
  }
}
