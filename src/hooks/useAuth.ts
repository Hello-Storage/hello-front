import { Api, LoadUserResponse, LoginResponse, setAuthToken } from "api";
import { signMessage, disconnect } from "@wagmi/core";
import { useAccount } from "wagmi";
import state from "state";
import {
  loadUser,
  loadUserFail,
  loadingUser,
  logoutUser,
} from "state/user/actions";
import { removeContent } from "state/mystorage/actions";
import { getSignature } from "utils";

const useAuth = () => {
  const { address, isConnected } = useAccount();

  const load = async () => {
    try {
      state.dispatch(loadingUser());
      const loadResp = await Api.get<LoadUserResponse>("/load");

      // if signature not registered
      if (loadResp.data.signature === "" && isConnected && address)
        loadResp.data.signature = await getSignature(address);
      state.dispatch(loadUser(loadResp.data));
    } catch (error) {
      state.dispatch(loadUserFail());
    }
  };

  const login = async (wallet_address: string) => {
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
  };

  // otp (one-time-passcode login)
  const startOTP = async (email: string) => {
    try {
      await Api.post("/otp/start", { email });
    } catch (error) {
      return false;
    }

    return true;
  };

  const verifyOTP = async (email: string, code: string) => {
    try {
      const result = await Api.post<LoginResponse>("/otp/verify", {
        email,
        code,
      });
      setAuthToken(result.data.access_token);
      load();
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    state.dispatch(logoutUser());

    setAuthToken(undefined);
    state.dispatch(removeContent(""));

    // disconnect when you sign with wallet
    disconnect();
  };

  return {
    login,
    startOTP,
    verifyOTP,
    load,
    logout,
  };
};

export default useAuth;
