import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublishedFile } from "./Utils/shareUtils";
import { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { File } from "api";
import { useDispatch } from "react-redux";
import "lightbox.js-react/dist/index.css";

import { useAppSelector } from "state";
import useFetchGroupHashes from "./Utils/useGetHashesFromGroup";
import Imageview from "components/ImageView/Imageview";
import Content from "pages/MyStorage/components/Content";
dayjs.extend(relativeTime);

const ShareSharedWithMeGroupdWithMe = () => {
	//get the hash from the url
	const { group_id } = useParams();

	const { grouphashes, loading } = useFetchGroupHashes(
		group_id ? group_id : ""
	);
	const [error, seterror] = useState<boolean>()
	const [metadataList, setMetadataList] = useState<File[]>([]);

	const { showPreview } = useAppSelector((state) => state.mystorage);

	useEffect(() => {
		//get file metadata from the hash
		if (metadataList && metadataList.length == 0) {
			if (!grouphashes) {
				toast.error("Group not found")
				return
			}
			if (!group_id) {
				toast.error("Group not provided")
				return
			}

			if (
				group_id.length > 0 &&
				grouphashes.length > 0 &&
				!loading
			) {
				// Create a temporary array to store metadata
				const tempMetadataList: File[] = [];
				// Use Promise.all to handle multiple asynchronous requests concurrently
				Promise.all(
					grouphashes.map((hash) => {
						return getPublishedFile(hash).then((res) => {
							res = res as AxiosResponse;
							if (res && res.status === 200) {
								const publishedFile = res.data as File;
								tempMetadataList.push(publishedFile);
							}
						});
					})
				).then(() => {
					setMetadataList(tempMetadataList);
				}).catch(() => {
					toast.error("An error occured while fetching the file metadata");
					seterror(true)
				});
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [grouphashes]);

	return (
		<>
			{(metadataList && metadataList.length > 0) && (
				<section>
					{/* <Imageview
						isOpen={showPreview}
						files={metadataList}
						loaded={loaded}
						setloaded={setloaded}
					></Imageview> */}
					<div className="w-full flex">
						<div className="w-[99%] share-content">
							<Content
								loading={loading}
								actionsAllowed={false}
								files={metadataList}
								folders={[]}
								view="list"
								showHorizontalFolders={false}
								showFolders={true}
								filesTitle="Shared Files"
								identifier={1}
							/>
						</div>
					</div>
				</section>
			)}
			{(error) && (
				<div className="flex items-center justify-center h-full">
					<span className="text-2xl text-gray-400">Group not found</span>
				</div>
			)}
		</>
	);
};

export default ShareSharedWithMeGroupdWithMe;
