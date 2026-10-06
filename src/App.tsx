import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PresidentePage } from './pages/PresidentePage'
import { GovernadoresPage } from './pages/GovernadoresPage'
import { PrimeiroTurnoPage } from './pages/PrimeiroTurnoPage'
import { EstadosPage } from './pages/EstadosPage'
import { NoticiasPage } from './pages/NoticiasPage'

/** Links antigos /estados/:uf passaram para o arquivo do 1º turno. */
function RedirecionaEstados() {
  const { uf } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/1-turno/estados${uf ? `/${uf}` : ''}${search}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PresidentePage turno={2} />} />
          <Route path="governadores" element={<GovernadoresPage />} />
          <Route path="governadores/:uf" element={<GovernadoresPage />} />
          <Route path="1-turno" element={<PrimeiroTurnoPage />}>
            <Route index element={<PresidentePage turno={1} />} />
            <Route path="estados" element={<EstadosPage />} />
            <Route path="estados/:uf" element={<EstadosPage />} />
          </Route>
          <Route path="estados" element={<RedirecionaEstados />} />
          <Route path="estados/:uf" element={<RedirecionaEstados />} />
          <Route path="noticias" element={<NoticiasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
