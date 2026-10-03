export interface UF {
  sigla: string
  nome: string
  regiao: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'
  /** posição no mapa em grade (coluna, linha) */
  grid: [number, number]
}

export const UFS: UF[] = [
  { sigla: 'RR', nome: 'Roraima', regiao: 'Norte', grid: [2, 1] },
  { sigla: 'AP', nome: 'Amapá', regiao: 'Norte', grid: [3, 1] },
  { sigla: 'AM', nome: 'Amazonas', regiao: 'Norte', grid: [2, 2] },
  { sigla: 'PA', nome: 'Pará', regiao: 'Norte', grid: [3, 2] },
  { sigla: 'MA', nome: 'Maranhão', regiao: 'Nordeste', grid: [4, 2] },
  { sigla: 'CE', nome: 'Ceará', regiao: 'Nordeste', grid: [5, 2] },
  { sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste', grid: [6, 2] },
  { sigla: 'AC', nome: 'Acre', regiao: 'Norte', grid: [1, 3] },
  { sigla: 'RO', nome: 'Rondônia', regiao: 'Norte', grid: [2, 3] },
  { sigla: 'TO', nome: 'Tocantins', regiao: 'Norte', grid: [4, 3] },
  { sigla: 'PI', nome: 'Piauí', regiao: 'Nordeste', grid: [5, 3] },
  { sigla: 'PB', nome: 'Paraíba', regiao: 'Nordeste', grid: [7, 3] },
  { sigla: 'PE', nome: 'Pernambuco', regiao: 'Nordeste', grid: [6, 3] },
  { sigla: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste', grid: [3, 3] },
  { sigla: 'AL', nome: 'Alagoas', regiao: 'Nordeste', grid: [7, 4] },
  { sigla: 'SE', nome: 'Sergipe', regiao: 'Nordeste', grid: [6, 4] },
  { sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste', grid: [5, 4] },
  { sigla: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste', grid: [4, 4] },
  { sigla: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste', grid: [4, 5] },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste', grid: [3, 4] },
  { sigla: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste', grid: [5, 5] },
  { sigla: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste', grid: [6, 5] },
  { sigla: 'SP', nome: 'São Paulo', regiao: 'Sudeste', grid: [4, 6] },
  { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste', grid: [5, 6] },
  { sigla: 'PR', nome: 'Paraná', regiao: 'Sul', grid: [3, 6] },
  { sigla: 'SC', nome: 'Santa Catarina', regiao: 'Sul', grid: [3, 7] },
  { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul', grid: [3, 8] },
]

export const UF_BY_SIGLA = Object.fromEntries(UFS.map((u) => [u.sigla, u])) as Record<string, UF>
