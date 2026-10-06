# Apuração 2026: eleições ao vivo

App React + TypeScript (Vite) para acompanhar em tempo real a apuração das Eleições 2026:
presidente, governadores, senadores, deputados federais e estaduais/distritais, por estado,
com fotos dos candidatos e últimas notícias.

## Fontes de dados

- **Resultados**: API pública de divulgação do TSE (`resultados.tse.jus.br/oficial/ele2026/...`),
  consultada direto do navegador (o TSE libera CORS). Atualização a cada 30s.
  - `6257` / `6258`: eleição federal (Presidente), 1º / 2º turno
  - `6259` / `6260`: eleição estadual (Governador, Senador, Deputados), 1º / 2º turno
  - Arquivo por cargo e abrangência: `/{eleicao}/dados/{uf}/{uf}-c{cargo}-e{eleicao}-u.json`
  - Fotos: `/{eleicao}/fotos/{uf}/{sqcand}.jpeg`
  - Enquanto o TSE não publica os arquivos do 2º turno (404), o app monta o confronto com os
    candidatos marcados como `2º turno` no resultado final do 1º turno, com votos zerados.
- **Notícias**: RSS do g1 Política e do Google Notícias, agregados pela função serverless
  `api/news.ts` (feeds RSS não liberam CORS). Uso pessoal/não comercial, conforme os termos do Google Notícias.

## Rodando

```bash
npm install
npm run dev     # http://localhost:5173 (inclui /api/news via middleware do Vite)
npm run build
```

Antes da apuração começar os votos ficam zerados. Use o link **"Ver simulação da apuração"** no
rodapé para ver o app com votos fictícios.

## Deploy na Vercel

1. Suba o repositório no GitHub e importe na Vercel (framework detectado: Vite).
2. Nada a configurar: `vercel.json` faz o fallback de rotas para o SPA e `api/news.ts` vira função serverless.

## Estrutura

```
api/news.ts            função serverless de notícias
src/api/tse.ts         cliente da API do TSE + normalização
src/api/simulacao.ts   modo simulação
src/hooks/usePolling   polling com pausa quando a aba está oculta
src/components/        cards, mapa do Brasil, tabelas, notícias
src/pages/             Presidente e Governadores (2º turno), arquivo do 1º turno, Notícias
```
