/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api, EncryptionStatus, File, Folder, RootResponse } from 'api';
import getAccountType from 'api/getAccountType';
import getPersonalSignature from 'api/getPersonalSignature';
import { FolderContentClass, InternalFolderClass } from './types';
import { useAuth } from 'hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from 'state';
import { handleEncryptedFiles, handleEncryptedFolders } from 'utils/encryption/filesCipher';

const useGetFolderFiles = (selectedShareFolder: Folder) => {
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
        if (selectedShareFolder) {
            const root = "/folder/" + selectedShareFolder.uid;
            Api.get<RootResponse>(root)
                .then(async (res) => {
                    personalSignatureRef.current =
                        sessionStorage.getItem("personal_signature") ?? undefined;
                    if (!personalSignatureRef.current) {
                        toast.error("Failed to fetch root!");
                        return;
                    }

                    fetchContent(res.data.files, res.data.folders).then((contentD) => {
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
                                    fetchData(folderContentIn.folder)
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

                })
        }
    };

    useEffect(() => {
        fetchData(folderContent.current);
    }, [selectedShareFolder]);

    return { folderContent };
};

export default useGetFolderFiles;
