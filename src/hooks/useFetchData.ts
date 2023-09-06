import { useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Api, EncryptionStatus, RootResponse, UserDetailResponse } from "api";
import { useAppDispatch, useAppSelector } from "state";
import { fetchContent } from "state/mystorage/actions";
import { loadUserDetail } from "state/userdetail/actions";
import { File, Folder } from "api/types/base";
import getPersonalSignature from "api/getPersonalSignature";
import { toast } from "react-toastify";
import { decryptContent, decryptMetadata, hexToBuffer } from "utils/encryption/filesCipher";
import getAccountType from "api/getAccountType";
import { logoutUser } from "state/user/actions";
import useAuth from "./useAuth";

const useFetchData = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector(
    (state) => state.userdetail
  );
  const { logout } = useAuth();
  const personalSignatureRef = useRef<string | undefined>();

  const accountType = getAccountType();

  const handleEncryptedFiles = async (files: File[]) => {

    // Using map to create an array of promises
    const decrytpedFilesPromises = files.map(async (file) => {
      if (file.status === EncryptionStatus.Encrypted) {
        try {
          const decryptionResult = await decryptMetadata(file.name, file.mime_type, file.cid_original_encrypted, personalSignatureRef.current)
          if (decryptionResult) {
            const { decryptedFilename, decryptedFiletype, decryptedCidOriginal } = decryptionResult;
            return {
              ...file,
              name: decryptedFilename,
              mime_type: decryptedFiletype,
              cid_original_encrypted: decryptedCidOriginal,
            }
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

    // Using map to create an array of promises
    const decrytpedFoldersPromises = folders.map(async (folder) => {
      if (folder.status === EncryptionStatus.Encrypted) {
        // encrypt file metadata and blob
        const folderTitleBuffer = hexToBuffer(folder.title)
        const decryptedTitleBuffer = await decryptContent(folderTitleBuffer, personalSignatureRef.current)
        //transform buffer to Uint8Array
        const decryptedTitle = new TextDecoder().decode(decryptedTitleBuffer)

        return {
          ...folder,
          title: decryptedTitle,
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
        personalSignatureRef.current = await getPersonalSignature(name, autoEncryptionEnabled, accountType) //Promise<string | undefined>
        if (!personalSignatureRef.current) {
          toast.error("Failed to get personal signature");
          logout();
          return;
        }
        const decryptedFiles = await handleEncryptedFiles(res.data.files).catch((err) => { console.log(err) });
        const decryptedFolders = await handleEncryptedFolders(res.data.folders).catch((err) => { console.log(err) });
        const decryptedPath = await handleEncryptedFolders(res.data.path).catch((err) => { console.log(err) });
        if (!decryptedFiles || !decryptedFolders || !decryptedPath) {
          toast.error("Failed to decrypt files");
          dispatch(fetchContent(res.data));
          return;
        }
        dispatch(fetchContent({ ...res.data, files: decryptedFiles, folders: decryptedFolders, path: decryptedPath }));
      })
      .catch((err) => { console.log(err) });
  }, [location.pathname]);

  const fetchUserDetail = useCallback(() => {
    Api.get<UserDetailResponse>("/user/detail")
      .then((res) => {
        dispatch(loadUserDetail(res.data));
      })
      .catch((err) => { console.log(err) });
  }, []);

  return {
    fetchRootContent,
    fetchUserDetail,
  };
};

export default useFetchData;