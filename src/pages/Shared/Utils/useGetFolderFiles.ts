/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api, File, Folder, RootResponse } from 'api';
import getAccountType from 'api/getAccountType';
import getPersonalSignature from 'api/getPersonalSignature';
import { useAuth } from 'hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from 'state';
import { handleEncryptedFiles, handleEncryptedFolders } from 'utils/encryption/filesCipher';

class FolderContentClass {
    folder?: Folder;
    content?: {
        files: File[];
        folders: FolderContentClass[];
    };

    constructor(folder?: Folder, content?: { files: File[]; folders: FolderContentClass[]; }) {
        this.folder = folder;
        this.content = content;
    }

    searchFolderAndSetContent(folder: Folder, content: { files: File[]; folders: FolderContentClass[]; }) {
        if (this.folder?.uid === folder?.uid) {
            this.content = content;
            return
        }
        if (this.content?.folders) {
            for (const folderContentClass of this.content?.folders) {
                folderContentClass.searchFolderAndSetContent(folder, content);
            }
        }
        return
    }
}

const useGetFolderFiles = (selectedShareFolder: Folder | undefined) => {
    const [loading, setLoading] = useState(true);
    const personalSignatureRef = useRef<string | undefined>();
    const folderContent = useRef<FolderContentClass>(new FolderContentClass(selectedShareFolder, undefined));
    const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);
    const { name } = useAppSelector((state) => state.user);
    const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
    const accountType = getAccountType();
    const { logout } = useAuth();

    async function fetchContent(files: File[], folders: Folder[]) {
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


    const fetchData = async (selectedShareFolder: FolderContentClass) => {
        if (selectedShareFolder.folder) {
            setLoading(true);
            let root = "/folder/" + selectedShareFolder.folder.uid;
            Api.get<RootResponse>(root)
                .then(async (res) => {
                    personalSignatureRef.current =
                        sessionStorage.getItem("personal_signature") ?? undefined;
                    if (!personalSignatureRef.current) {
                        toast.error("Failed to fetch root");
                        return;
                    }

                    fetchContent(res.data.files, res.data.folders).then((contentD) => {
                        if (contentD) {
                            const Data = {
                                files: contentD.files,
                                folders: contentD.folders,
                            };

                            const contentfolders: FolderContentClass[] = []

                            if (Data.folders.length > 0) {
                                for (const folder of Data.folders) {
                                    const folderContentIn = new FolderContentClass(folder, undefined);
                                    contentfolders.push(folderContentIn);
                                    fetchData(folderContentIn)
                                }
                            }

                            if (selectedShareFolder.folder) {
                                folderContent.current.searchFolderAndSetContent(selectedShareFolder.folder, {
                                    files: Data.files,
                                    folders: contentfolders,
                                });
                            }
                        }

                    })

                }).finally(() => {
                    setLoading(false)
                })
        }
    };

    useEffect(() => {
        fetchData(folderContent.current);
    }, [selectedShareFolder]);

    return { folderContent, loading };
};

export default useGetFolderFiles;
