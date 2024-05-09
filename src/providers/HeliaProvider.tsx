import { unixfs } from '@helia/unixfs'
import { createHelia } from 'helia'
import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useMemo,
  FC,
  ReactNode
} from 'react'

export const HeliaContext = createContext({
  helia: null,
  fs: null,
  error: false,
  starting: true
})

declare global {
  interface Window {
    helia: any;
  }
}

export const HeliaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [helia, setHelia] = useState<any>(null)
  const [fs, setFs] = useState<any>(null)
  const [starting, setStarting] = useState(true)
  const [error, setError] = useState<boolean>(false)

  const startHelia = useCallback(async () => {
    if (helia) {
      console.info('helia already started')
    } else if (window.helia) {
      console.info('found a windowed instance of helia, populating ...')
      setHelia(window.helia)
      setFs(unixfs(helia))
      setStarting(false)
    } else {
      try {
        console.info('Starting Helia')
				const libp2p = await createLibp2p({
					transports: [webSockets()],
				});
        const helia = await createHelia({libp2p})
        setHelia(helia)
        setFs(unixfs(helia))
        setStarting(false)
      } catch (e) {
        console.error(e)
        setError(true)
      }
    }
  }, [])

  useEffect(() => {
    startHelia()
  }, [])

  const obj = useMemo(() => ({
    helia,
    fs,
    error,
    starting
  }), [helia, starting, error, fs]);

  return (
    <HeliaContext.Provider value={obj} >
      {children}
    </HeliaContext.Provider>
  )
}
