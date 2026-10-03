import { buscarResultado, type Resultado } from '../api/tse'
import type { CargoId, Turno } from '../config'
import { usePolling } from './usePolling'

export function useResultado(cargo: CargoId, abrangencia: string, turno: Turno = 1) {
  return usePolling<Resultado>(`${cargo}:${abrangencia}:${turno}`, (signal) =>
    buscarResultado(cargo, abrangencia, turno, signal),
  )
}
