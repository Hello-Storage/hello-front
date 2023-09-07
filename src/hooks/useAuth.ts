import { useCallback } from "react";
import { Api, LoadUserResponse, LoginResponse, RootResponse, setAuthToken } from "api";
import { signMessage, disconnect } from "@wagmi/core";
import state from "state";
import {
  loadUser,
  loadUserFail,
  loadingUser,
  logoutUser,
} from "state/user/actions";
import setPersonalSignature from "api/setPersonalSignature";
import setAccountType from "api/setAccountType";
import { fetchContent, removeContent } from "state/mystorage/actions";

const useAuth = () => {
  const load = useCallback(async () => {
    try {
      state.dispatch(loadingUser());
      const loadResp = await Api.get<LoadUserResponse>("/load");

      state.dispatch(loadUser(loadResp.data));
    } catch (error) {
      state.dispatch(loadUserFail());
    }
  }, []);

  const login = useCallback(async (wallet_address: string) => {
    localStorage.removeItem("access_token");
    setAuthToken(undefined);
    localStorage.removeItem("account_type")
    setAccountType(undefined);
    sessionStorage.removeItem("personal_signature");
    setPersonalSignature(undefined);

    const nonceResp = await Api.post<string>("/nonce", {
      wallet_address,
    });

    const message = `Greetings from joinhello\nSign this message to log into joinhello\nnonce: ${nonceResp.data}`;

    const signature = await signMessage({ message });

    const loginResp = await Api.post<LoginResponse>("/login", {
      wallet_address,
      signature,
    });

    setAuthToken(loginResp.data.access_token);
    setAccountType("web3")

    load();
  }, []);

  const logout = useCallback(() => {
    state.dispatch(logoutUser());

    setAuthToken(undefined);
    setPersonalSignature(undefined);
    setAccountType(undefined);
    state.dispatch(removeContent(""));

    // disconnect when you sign with wallet
    disconnect();
  }, []);

  return {
    login,
    load,
    logout,
  };
};

export default useAuth;

