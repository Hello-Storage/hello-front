/* eslint-disable react-hooks/exhaustive-deps */
import { Api } from "api";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export function useShareGroup(fileSharedState: ShareState[]) {
	const shareHashReady = useCallback(
		(sharestateList: ShareState[]): boolean => {
			return sharestateList.every(sharestate => sharestate.public_file.share_hash !== "");
		},
		[],
	);

	const [groupId, setGroupId] = useState<string | null>(null);

	useEffect(() => {
		const createShareGroup = async () => {
			if (fileSharedState && fileSharedState.length > 0 && shareHashReady(fileSharedState)) {
				try {
					const shareHashList = fileSharedState.map(sharestate => sharestate.public_file.share_hash);
					const response = await Api.post("/file/share/group", {
						share_hashes: shareHashList,
					});
					const { share_group: groupIdFromResponse } = response.data;
					setGroupId(groupIdFromResponse);
				} catch (error) {
					console.error("Error creating share group:", error);
					toast.error("Error creating share group");
				}
			}else{
				setGroupId(null);
			}
		};

		createShareGroup();
	}, [fileSharedState]);

	return groupId;
}
