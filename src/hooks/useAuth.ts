import { useCallback } from "react";
import { Api, LoadUserResponse, LoginResponse, setAuthToken } from "api";
import { signMessage } from "@wagmi/core";
import state from "state";
import { loadUser } from "state/user/actions";

const useAuth = () => {
  const load = useCallback(async () => {
    try {
      const loadResp = await Api.get<LoadUserResponse>("/load");

      state.dispatch(loadUser(loadResp.data));
    } catch (error) {
      //   console.log(error);
      throw error;
    }
  }, []);

  const login = useCallback(async (wallet_address: string) => {
    try {
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

      load();
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    login,
    load,
  };
};

export default useAuth;
