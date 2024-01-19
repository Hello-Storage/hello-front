import { Api } from "api"
import { useEffect, useState } from "react"
import { MdFolderShared } from "react-icons/md";
import { useParams } from "react-router-dom"
import { ShareFolderResponse } from "./Utils/types"
import Content from "pages/MyStorage/components/Content"
import { useAppSelector } from "state"
import Imageview from "components/ImageView/Imageview"

export function FolderShared() {
    const [loaded, setloaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<ShareFolderResponse>()
    const [error, seterror] = useState()

    const {
        showPreview,
    } = useAppSelector((state) => state.mystorage);

    const { folderuid } = useParams<{ folderuid: string }>()

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
            {(content && content.files && !loading) && (
                <section>
                    <Imageview
                        isOpen={showPreview}
                        files={content.files}
                        loaded={loaded}
                        setloaded={setloaded}
                    ></Imageview>
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
                                files={content.files}
                                folders={content.folders}
                                view="list"
                                showHorizontalFolders={false}
                                showFolders={true}
                                filesTitle=""
                                identifier={1}
                                setloaded={setloaded}
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
            {(content && !content.files) && (
                <div className="flex items-center justify-center h-full">
                    <span className="text-2xl text-gray-400">Folder Empty</span>
                </div>
            )}
        </>
    )
}