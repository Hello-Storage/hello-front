/* eslint-disable react-hooks/exhaustive-deps */
import { Api } from "api";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "state";
import { refreshAction } from "state/mystorage/actions";

interface ApiKeyResponse {
    id: number;
    user_id: number;
    api_key: string;
    key_requests: number;
    created_at: string;
}

const useApikey = (setApiKey: React.Dispatch<React.SetStateAction<string | null>>) => {
    const dispatch = useAppDispatch();
    const { refresh } = useAppSelector(
        (state) => state.mystorage
    );

    useEffect(() => {

        Api.get<ApiKeyResponse>("/api_key").then((res) => {
            setApiKey(res.data.api_key);
        }).catch(() => {
            setApiKey(null)
        }).finally(() => {
            dispatch(refreshAction(false))
        })
    }, [refresh]);

};

export default useApikey;
