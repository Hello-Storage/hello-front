import { unixfs } from "@helia/unixfs";
import { HeliaLibp2p, createHelia } from "helia";
import {
	useEffect,
	useState,
	useCallback,
	createContext,
	useMemo,
	FC,
	ReactNode,
} from "react";
import { isSafari } from "utils/user";

type HeliaContextTypes = {
	helia: HeliaLibp2p<any> | null;
	fs: any;
	error: boolean;
	starting: boolean;
};

export const HeliaContext = createContext<HeliaContextTypes>({
	helia: null,
	fs: null,
	error: false,
	starting: true,
});

declare global {
	interface Window {
		helia: any;
	}
}

export const HeliaProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [helia, setHelia] = useState<HeliaLibp2p<any> | null>(null);
	const [fs, setFs] = useState<any>(null);
	const [starting, setStarting] = useState(true);
	const [error, setError] = useState<boolean>(false);

	const startHelia = useCallback(async () => {
		if (helia) {
			console.info("helia already started");
		} else if (window.helia) {
			console.info("found a windowed instance of helia, populating ...");
			setHelia(window.helia);
			setStarting(false);
		} else {
			try {
				console.info("Starting Helia");
				if (!isSafari() ) {
					import("libp2p").then(async ({ createLibp2p }) => {
						import("@libp2p/websockets").then(
							async ({ webSockets }) => {
								const libp2p = await createLibp2p({
									transports: [webSockets()],
								});
								const helia = await createHelia({ libp2p });
								setHelia(helia);
								setStarting(false);
							}
						);
					});
				} else {
					setStarting(false);
					setError(true);
				}
			} catch (e) {
				console.error(e);
				setError(true);
			}
		}
	}, []);

	useEffect(() => {
		startHelia();
	}, []);

	useEffect(() => {
		if (helia) {
			console.info("helia started");
			setFs(unixfs(helia));
		}
	}, [helia]);

	const obj = useMemo(
		() => ({
			helia,
			fs,
			error,
			starting,
		}),
		[starting, error, fs]
	);

	return (
		<HeliaContext.Provider value={obj}>{children}</HeliaContext.Provider>
	);
};
