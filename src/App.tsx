import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PresidentePage } from './pages/PresidentePage'
import { EstadosPage } from './pages/EstadosPage'
import { NoticiasPage } from './pages/NoticiasPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PresidentePage />} />
          <Route path="estados" element={<EstadosPage />} />
          <Route path="estados/:uf" element={<EstadosPage />} />
          <Route path="noticias" element={<NoticiasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
