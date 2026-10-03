import { NavLink, Outlet } from 'react-router-dom'
import { alternarSimulacao, simulacaoAtiva } from '../api/simulacao'

function Logo() {
  return (
    <svg className="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#009c3b" />
      <path d="M20 6 L35 20 L20 34 L5 20 Z" fill="#ffdf00" />
      <circle cx="20" cy="20" r="8" fill="#002776" />
      <path d="M12.5 18.5 Q20 16 27.5 20.5" stroke="#fff" strokeWidth="1.6" fill="none" />
    </svg>
  )
}

export function Layout() {
  const simulando = simulacaoAtiva()
  return (
    <>
      {simulando && (
        <div className="faixa-simulacao">
          <strong>Modo simulação:</strong> os votos exibidos são fictícios, gerados sobre os candidatos reais.
          <button onClick={alternarSimulacao}>Voltar aos dados oficiais</button>
        </div>
      )}
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <Logo />
            <div>
              Apuração <span>2026</span>
            </div>
          </NavLink>
          <span className="live-badge">
            <span className="live-dot" /> Ao vivo
          </span>
          <nav className="nav">
            <NavLink to="/" end>
              Presidente
            </NavLink>
            <NavLink to="/estados">Estados</NavLink>
            <NavLink to="/noticias">Notícias</NavLink>
          </nav>
        </div>
      </header>
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          Dados oficiais do{' '}
          <a href="https://resultados.tse.jus.br" target="_blank" rel="noreferrer">
            TSE (Divulgação de Resultados)
          </a>
          . Projeto independente, sem vínculo com a Justiça Eleitoral.{' '}
          <button className="link-simulacao" onClick={alternarSimulacao}>
            {simulando ? 'Desativar simulação' : 'Ver simulação da apuração'}
          </button>
        </div>
      </footer>
    </>
  )
}
