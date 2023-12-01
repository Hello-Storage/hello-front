/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from 'api';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const useFetchGroupHashes = (shareGroupID: string) => {
    const [grouphashes, setGroupHashes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (shareGroupID !== "") {
                try {
                    const response = await Api.get(`/file/share/group/${shareGroupID}`);
                    const fetchedHashes = response.data.share_hashes;
                    setGroupHashes(fetchedHashes);
                } catch (error: any) {
                    toast.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [shareGroupID]);

    return { grouphashes, loading };
};

export default useFetchGroupHashes;
