import { NaoDisponivelError } from '../api/tse'

export function Carregando({ texto = 'Carregando resultados…' }: { texto?: string }) {
  return (
    <div className="estado-msg">
      <div className="loader" />
      {texto}
    </div>
  )
}

export function Erro({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const naoDisponivel = error instanceof NaoDisponivelError
  return (
    <div className={`estado-msg ${naoDisponivel ? '' : 'estado-erro'}`}>
      <strong>{naoDisponivel ? 'Ainda sem dados' : 'Não foi possível carregar'}</strong>
      <span>{error.message}</span>
      {onRetry && (
        <button className="btn-refresh" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
