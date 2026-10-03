import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/resultado.css'
import './components/noticias.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
