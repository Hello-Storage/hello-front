import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Api, EncryptionStatus, RootResponse, UserDetailResponse } from "api";
import { useAppDispatch, useAppSelector } from "state";
import { fetchContent } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";
import { File, Folder } from "api/types/base";
import getPersonalSignature from "api/getPersonalSignature";
import { toast } from "react-toastify";
import { bufferToBase64Url, decryptContent, decryptMetadata, hexToBuffer } from "utils/encryption/filesCipher";

const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { name } = useAppSelector((state) => state.user);

  const handleEncryptedFiles = async (files: File[]) => {

    const personalSignature = await getPersonalSignature(name, true);
    if (!personalSignature) {
      toast.error("Failed to get personal signature");
      return;
    }


    // Using map to create an array of promises
    const decrytpedFilesPromises = files.map(async (file) => {
      if (file.status === EncryptionStatus.Encrypted) {
        try {
          // encrypt file metadata and blob
          const { decryptedFilename, decryptedFiletype, decryptedCidOriginal } = await decryptMetadata(file.name, file.mime_type, file.cid_original_encrypted, personalSignature)
          return {
            ...file,
            name: decryptedFilename,
            mime_type: decryptedFiletype,
            cid_original_encrypted: decryptedCidOriginal,
          }
        } catch (error) {
          console.log(error)
          return file;
        }
      }
      return file;
    });

    // Wait for all promises to resolve
    const decryptedFiles = await Promise.all(decrytpedFilesPromises);
    return decryptedFiles;
  }

  const handleEncryptedFolders = async (folders: Folder[]) => {
    const personalSignature = await getPersonalSignature(name, true);
    if (!personalSignature) {
      toast.error("Failed to get personal signature");
      return;
    }

    // Using map to create an array of promises
    const decrytpedFoldersPromises = folders.map(async (folder) => {
      if (folder.status === EncryptionStatus.Encrypted) {
        try {
          // encrypt file metadata and blob
          const folderTitleBuffer =  hexToBuffer(folder.title)
          const decryptedTitleBuffer = await decryptContent(folderTitleBuffer, personalSignature)
          //transform buffer to Uint8Array
          const decryptedTitle = new TextDecoder().decode(decryptedTitleBuffer)

          return {
            ...folder,
            title: decryptedTitle,
          }
        } catch (error) {
          console.log(error)
          return folder;
        }
      }
      return folder;
    });

    // Wait for all promises to resolve
    const decryptedFolders = await Promise.all(decrytpedFoldersPromises);
    return decryptedFolders;
  }
  

  const fetchRootContent = useCallback(() => {
    let root = "/folder";

    if (location.pathname.includes("/folder")) {
      root = "/folder/" + location.pathname.split("/")[2];
    }

    Api.get<RootResponse>(root)
      .then(async (res) => {
        const decryptedFiles = await handleEncryptedFiles(res.data.files);
        const decryptedFolders = await handleEncryptedFolders(res.data.folders);
        const decryptedPath = await handleEncryptedFolders(res.data.path);
        if (!decryptedFiles || !decryptedFolders || !decryptedPath) {
          toast.error("Failed to decrypt files");
          dispatch(fetchContent(res.data));
          return;
        }
        dispatch(fetchContent({ ...res.data, files: decryptedFiles, folders: decryptedFolders, path: decryptedPath }));
      })
      .catch((err) => {console.log(err)});
  }, [location.pathname]);

  const fetchUserDetail = useCallback(() => {
    Api.get<UserDetailResponse>("/user/detail")
      .then((res) => {
        dispatch(loadUserDetail(res.data));
      })
      .catch((err) => { console.log(err)});
  }, []);

  return {
    fetchRootContent,
    fetchUserDetail,
  };
};

export default useFetchData;