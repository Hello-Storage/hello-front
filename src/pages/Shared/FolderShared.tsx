import { Api } from "api"
import { useEffect, useState } from "react"
import { MdFolderShared } from "react-icons/md";
import { useParams } from "react-router-dom"
import { ShareFolderResponse } from "./Utils/types"
import Content from "pages/MyStorage/components/Content"
import { useAppSelector } from "state"
import { useModal } from "components/Modal";
import { CustomFileViewer } from "components/ImageView/CustomFileViewer";
import { useDispatch } from "react-redux";
import { resetCache, setFileViewAction, setImageViewAction } from "state/mystorage/actions";

export function FolderShared() {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<ShareFolderResponse>()
    const [error, seterror] = useState()

    const {
        showPreview,
    } = useAppSelector((state) => state.mystorage);

    const [onPresent] = useModal(<CustomFileViewer
        files={content ? content.files ? content.files : [] : []}
    />);

    useEffect(() => {
        if (showPreview && (content ? content.files ? content.files : [] : []).length > 0) {
            onPresent();
        }
    }, [showPreview]);

    const { folderuid } = useParams<{ folderuid: string }>()

	const dispatch = useDispatch();
	
	useEffect(() => {
		dispatch(setImageViewAction({ show: false }));
		dispatch(resetCache())
		dispatch(setFileViewAction({ file: undefined }));
	}, [])
    useEffect(() => {
        Api.get<ShareFolderResponse>(`/folder/shared-uid/${folderuid}`).then((response) => {
            setContent(response.data)
            setLoading(false)
        }).catch((error) => {
            seterror(error)
        })
    }, [folderuid])

    return (
        <>
            {(content && ((content.files && content.files.length > 0) || (content.folders && content.folders.length > 0)) && !loading) && (
                <section>
                    <h3 className="my-2 text-xl">Shared Folder</h3>
                    <div className="flex items-center mb-2">
                        <MdFolderShared className="mr-2" />
                        <span className="text-lg">{content.title}</span>
                    </div>
                    <div className="w-full flex">
                        <div className="w-[99%] share-content">
                            <Content
                                loading={loading}
                                actionsAllowed={false}
                                files={content.files ? content.files : []}
                                folders={content.folders ? content.folders : []}
                                view="list"
                                showHorizontalFolders={false}
                                showFolders={true}
                                filesTitle=""
                                identifier={1}
                            />
                        </div>
                    </div>
                </section>
            )}
            {(error) && (
                <div className="flex items-center justify-center h-full">
                    <span className="text-2xl text-gray-400">Folder not found</span>
                </div>
            )}
            {(content && ((!content.files || content.files.length === 0) && (!content.folders || content.folders.length === 0))) && (
                <div className="flex items-center justify-center h-full">
                    <span className="text-2xl text-gray-400">Folder Empty</span>
                </div>
            )}
        </>
    )
}