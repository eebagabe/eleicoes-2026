import { NavLink, Outlet } from 'react-router-dom'
import { alternarSimulacao, simulacaoAtiva } from '../api/simulacao'

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function Logo() {
  return (
    <svg className="brand-logo" viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#3d8b63" />
      <path d="M20 6 L35 20 L20 34 L5 20 Z" fill="#e9c46a" />
      <circle cx="20" cy="20" r="8" fill="#24406e" />
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
          Você está vendo uma <strong>simulação</strong>. Os votos são fictícios, gerados sobre os candidatos reais.
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
          <div className="modo" role="group" aria-label="Fonte dos dados">
            <button className={simulando ? '' : 'ativo'} onClick={simulando ? alternarSimulacao : undefined} aria-pressed={!simulando}>
              <span className="live-dot" /> Ao vivo
            </button>
            <button className={simulando ? 'ativo' : ''} onClick={simulando ? undefined : alternarSimulacao} aria-pressed={simulando}>
              Simulação
            </button>
          </div>
          <nav className="nav">
            <NavLink to="/" end>
              Presidente
            </NavLink>
            <NavLink to="/governadores">Governadores</NavLink>
            <NavLink to="/1-turno">1º turno</NavLink>
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
        <div className="container footer-inner">
          <p>
            Dados oficiais do{' '}
            <a href="https://resultados.tse.jus.br" target="_blank" rel="noreferrer">
              TSE
            </a>
            . Projeto independente, sem vínculo com a Justiça Eleitoral.
          </p>
          <a className="autor" href="https://github.com/eebagabe" target="_blank" rel="noreferrer">
            <GithubIcon /> Feito por eebagabe
          </a>
        </div>
      </footer>
    </>
  )
}
