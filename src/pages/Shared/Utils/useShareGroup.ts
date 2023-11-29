import { Api } from "api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export function useShareGroup(fileSharedState: ShareState[]) {
	const [isReady, setIsReady] = useState(false);
	const [requestMade, setRequestMade] = useState(false);
	const [groupId, setGroupId] = useState(null);

	const shareHashReady = useCallback(
		(sharestateList: ShareState[]) => {
			const uniqueShareHashes = new Set();
			for (const sharestate of sharestateList) {
				uniqueShareHashes.add(sharestate.public_file.share_hash);
			}
			return !Array.from(uniqueShareHashes).includes("");
		},
		[]
	);

	const createShareGroup = useCallback(async () => {
		if (isReady && !requestMade) {
			try {
				const shareHashList = fileSharedState.map(sharestate => sharestate.public_file.share_hash);
				if (shareHashList.length > 0) {
					const response = await Api.post("/file/share/group", {
						share_hashes: shareHashList,
					});
					const { share_group: groupIdFromResponse } = response.data;
					setGroupId(groupIdFromResponse);
					setRequestMade(true);
				}
			} catch (error) {
				console.error("Error creating share group:", error);
				toast.error("Error creating share group");
			}
		}
	}, [fileSharedState, isReady, requestMade]);

	useEffect(() => {
		setIsReady(fileSharedState && fileSharedState.length > 0 && shareHashReady(fileSharedState));
	}, [fileSharedState, shareHashReady]);

	useEffect(() => {
		if (isReady && !requestMade) {
			createShareGroup();
		}
	}, [isReady, requestMade, createShareGroup]);

	return groupId;
}
