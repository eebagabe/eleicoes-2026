import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { GET as newsHandler } from './api/news.ts'

/** Em desenvolvimento, serve /api/news com o mesmo handler da função serverless da Vercel. */
function apiDev(): Plugin {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use('/api/news', async (req, res) => {
        const response = await newsHandler(new Request(`http://localhost${req.originalUrl ?? req.url}`))
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDev()],
})
