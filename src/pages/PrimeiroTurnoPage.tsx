import { NavLink, Outlet } from 'react-router-dom'

/** Arquivo do 1º turno (4 de outubro): presidente e todos os cargos por estado. */
export function PrimeiroTurnoPage() {
  return (
    <>
      <div className="arquivo-turno">
        <span className="tag">Arquivo</span>
        <span>Resultado final do 1º turno, 4 de outubro de 2026.</span>
        <nav className="subnav">
          <NavLink to="/1-turno" end>
            Presidente
          </NavLink>
          <NavLink to="/1-turno/estados">Estados</NavLink>
        </nav>
      </div>
      <Outlet />
    </>
  )
}
