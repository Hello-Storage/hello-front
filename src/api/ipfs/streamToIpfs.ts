import { Api } from "api/api"
import axios from "axios"
import { AppDispatch } from "state"
import { createFileAction, removeFileAction } from "state/mystorage/actions"

export const StreamToIpfs = async (cid: string, filename: string, uid: string, dispatch: AppDispatch) => {
    return axios.post(import.meta.env.VITE_IPFS_STREAMING_API+"/put", {
        "cid": cid,
        "filename": filename
    }).then((res) => {
        if (res.status === 200) {
            Api.put(`/file/update/ipfshash`, {
                "ipfs_hash": res.data.response.Hash,
                "uid": uid
            }).then((resp) => {
                dispatch(removeFileAction(uid))
                dispatch(createFileAction(resp.data))
            }).catch((error) => {
                console.log(error)
            })
            return res.data.response.Hash
        }
    }).catch((error) => {
        console.log(error)
    })
}