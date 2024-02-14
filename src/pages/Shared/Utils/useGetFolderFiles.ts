import { Api, File, Folder, RootResponse } from 'api';
import getAccountType from 'api/getAccountType';
import getPersonalSignature from 'api/getPersonalSignature';
import { FolderContentClass, InternalFolderClass } from './types';
import { useAuth } from 'hooks';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from 'state';
import { handleEncryptedFiles, handleEncryptedFolders } from 'utils/encryption/filesCipher';


const useGetFolderFiles = (trigger: boolean, setTrigger: React.Dispatch<React.SetStateAction<boolean>>, selectedShareFolder: Folder | undefined, folderContent: FolderContentClass, setFolderContent: React.Dispatch<React.SetStateAction<FolderContentClass>>) => {
    const personalSignatureRef = useRef<string | undefined>();

    const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);
    const { name } = useAppSelector((state) => state.user);
    const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
    const accountType = getAccountType();
    const { logout } = useAuth();

    const fetchContent = async (files: File[], folders: Folder[]) => {
        const currentEncryptedFiles = files

        if (!personalSignatureRef.current && !hasCalledGetPersonalSignatureRef.current) {
            hasCalledGetPersonalSignatureRef.current = true;

            personalSignatureRef.current = await getPersonalSignature(
                name,
                autoEncryptionEnabled,
                accountType
            );//Promie<string | undefined>
            if (!personalSignatureRef.current) {
                toast.error("Failed to get personal signature");
                logout();
                return;
            }
        }

        const decryptedFiles = await handleEncryptedFiles(
            currentEncryptedFiles,
            personalSignatureRef.current || "",
            name,
            autoEncryptionEnabled,
            accountType,
            logout
        );

        const decryptedFolders = await handleEncryptedFolders(
            folders,
            personalSignatureRef.current || "",
        );

        return {
            files: decryptedFiles || [],
            folders: decryptedFolders || [],
        };
    }

    const fetchData = useCallback(async (selectedShareFolder: FolderContentClass) => {

        if (!selectedShareFolder) return;
        const root = "/folder/" + selectedShareFolder.uid;
        try {
            const res = await Api.get<RootResponse>(root)
            personalSignatureRef.current =
                sessionStorage.getItem("personal_signature") ?? undefined;
            if (!personalSignatureRef.current) {
                toast.error("Failed to fetch root!");
                return;
            }

            const contentD = await fetchContent(res.data.files, res.data.folders)
            if (contentD) {
                const Data = {
                    files: contentD.files,
                    folders: contentD.folders,
                };

                const contentfolders: InternalFolderClass[] = []

                if (Data.folders.length > 0) {
                    for (const folder of Data.folders) {
                        const folderContentIn = new InternalFolderClass(folder);
                        contentfolders.push(folderContentIn);
                        await fetchData(folderContentIn.folder)
                    }
                }

                if (selectedShareFolder.folder) {
                    setTrigger(!trigger)
                    const newFolderContent = selectedShareFolder.searchFolderAndSetContent(selectedShareFolder.folder,
                        { files: Data.files, folders: contentfolders })
                    setFolderContent(newFolderContent);
                }
            }


        } catch (error) {
            console.error("failed to fetch folder content:", error);
        }

        return folderContent;



    }, [folderContent]);

    useEffect(() => {
        if (selectedShareFolder) {
            fetchData(folderContent);
        }

    }, [selectedShareFolder, fetchData, folderContent]);

    return { folderContent };
};

export default useGetFolderFiles;