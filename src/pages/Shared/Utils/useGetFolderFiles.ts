/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api, File, Folder, RootResponse } from 'api';
import getAccountType from 'api/getAccountType';
import getPersonalSignature from 'api/getPersonalSignature';
import { useAuth } from 'hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppSelector } from 'state';
import { handleEncryptedFiles, handleEncryptedFolders } from 'utils/encryption/filesCipher';

const useGetFolderFiles = (selectedShareFolder: Folder | undefined) => {
    const [loading, setLoading] = useState(true);
    const personalSignatureRef = useRef<string | undefined>();
    const [folderContent, setFolderContent] = useState<RootResponse>();
    const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);
    const { name } = useAppSelector((state) => state.user);
    const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
    const accountType = getAccountType();
    const { logout } = useAuth();
    const [currentFiles, setCurrentFiles] = useState<File[]>([]);
    const [currentFolders, setCurrentFolders] = useState<Folder[]>([]);

    async function fetchContent(files: File[], folders: Folder[]) {
        // Slice the files array based on the calculated start and end indices.
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

        setCurrentFiles(decryptedFiles || []);

        const decryptedFolders = await handleEncryptedFolders(
            folders,
            personalSignatureRef.current || "",
        );
        setCurrentFolders(decryptedFolders || []);

    }

    useEffect(() => {
        if (selectedShareFolder) {
            if (folderContent && folderContent.files && folderContent.folders) {
                fetchContent(folderContent.files, folderContent.folders).then(() => {
                    setLoading(false);
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [folderContent?.files.length, folderContent?.folders.length]);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedShareFolder) {
                setLoading(true);
                let root = "/folder/" + selectedShareFolder.uid;
                Api.get<RootResponse>(root)
                    .then(async (res) => {
                        personalSignatureRef.current =
                            sessionStorage.getItem("personal_signature") ?? undefined;
                        if (!personalSignatureRef.current) {
                            toast.error("Failed to fetch root");
                            return;
                        }

                        const resDataA = {
                            ...res.data,
                            files: res.data.files,
                            folders: res.data.folders,
                        };

                        setFolderContent(resDataA);
                        setLoading(false);
                    })
            }
        };
        fetchData();
    }, [selectedShareFolder]);

    return { folderContent: [currentFiles, currentFolders], loading };
};

export default useGetFolderFiles;
