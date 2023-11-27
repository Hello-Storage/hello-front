/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from "react";

export function useShareGroup(fileSharedState: ShareState[], selectedShareTypes: string) {
	const shareHashReady = useCallback(
		(sharestateList: ShareState[]): boolean => {
			return sharestateList.every(sharestate => sharestate.public_file.share_hash !== "")
		},
		[],
	)

	useEffect(() => {
		if (fileSharedState && fileSharedState.length > 0) {
			console.log(fileSharedState);
			console.log(shareHashReady(fileSharedState));
			if (shareHashReady(fileSharedState)) {
				console.log("aca llamare a la api para agrupar archivos");
			}
		}
	}, [selectedShareTypes]);

	return null;
}

