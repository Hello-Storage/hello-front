import { HeliaContext } from 'providers/HeliaProvider'
import { useContext } from 'react'

export const useHelia = () => {
  const { helia, fs, error, starting } = useContext(HeliaContext)
  return { helia, fs, error, starting }
}
