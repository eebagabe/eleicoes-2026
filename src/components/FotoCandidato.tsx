import { useState } from 'react'

interface Props {
  src: string
  nome: string
  cor: string
  size?: number
}

export function FotoCandidato({ src, nome, cor, size = 72 }: Props) {
  const [erro, setErro] = useState(false)
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')

  return (
    <div className="foto" style={{ width: size, height: size, borderColor: cor }}>
      {erro ? (
        <span className="foto-iniciais" style={{ background: cor, fontSize: size * 0.36 }}>
          {iniciais}
        </span>
      ) : (
        <img src={src} alt={nome} loading="lazy" onError={() => setErro(true)} />
      )}
    </div>
  )
}
