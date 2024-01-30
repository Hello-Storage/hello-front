import { useCallback } from "react";
import { AccountType, Api, LoadUserResponse, LoginResponse, setAuthToken } from "api";
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
import { removeContent } from "state/mystorage/actions";
import { signPersonalSignature } from "utils/encryption/cipherUtils";
import * as Web3 from "web3";

const useAuth = () => {
  const load = useCallback(async () => {
		try {
			state.dispatch(loadingUser());
			if (localStorage.getItem("access_token")) {
				const loadResp = await Api.get<LoadUserResponse>("/load");

				const privateKey = loadResp.data.walletPrivateKey;

				if (privateKey) {
					//sign message with private key

					const signature = await signPersonalSignature(
						loadResp.data.walletAddress,
						localStorage.getItem("account_type") as AccountType,
						privateKey
					);
					setPersonalSignature(signature);
				}

				state.dispatch(loadUser(loadResp.data));
			} else {
				throw Error("User not found");
			}
		} catch (error) {
			state.dispatch(loadUserFail());
		}
  }, []);

  const login = useCallback(async (wallet_address: string) => {
    const referral = new URLSearchParams(window.location.search).get("ref");
    localStorage.removeItem("access_token");
    setAuthToken(undefined);
    localStorage.removeItem("account_type")
    setAccountType(undefined);
    sessionStorage.removeItem("personal_signature");
    setPersonalSignature(undefined);

    const nonceResp = await Api.post<string>("/nonce", {
      wallet_address,
      referral,
    });

    const message = `Greetings from hello\nSign this message to log into hello\nnonce: ${nonceResp.data}`;

    const signature = await signMessage({ message }).catch((error) => {
      throw new Error(error);
    });

    const loginResp = await Api.post<LoginResponse>("/login", {
      wallet_address,
      signature,
      referral,
    });
    setAuthToken(loginResp.data.access_token);
    setAccountType("provider")

    await load();
  }, []);

  // otp (one-time-passcode login)
  const startOTP = async (email: string ) => {
    const referrer_code = new URLSearchParams(window.location.search).get("ref");
    try {
      const account = Web3.eth.accounts.create();
      const wallet_address = account.address;
      const private_key = account.privateKey;
      await Api.post("/otp/start", { email, referrer_code, wallet_address, private_key });
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
      })
      setAuthToken(result.data.access_token);
      setAccountType("email")
      await load()
      return true;
    } catch (error) {
      return false;
    }
  }

  const logout = useCallback(() => {
    if (localStorage.getItem("access_token")) {
      setAuthToken(undefined);
    } else {
      state.dispatch(logoutUser());
  
      setPersonalSignature(undefined);
      setAccountType(undefined);
      state.dispatch(removeContent());
  
      // disconnect when you sign with wallet
      disconnect();
    }
  }, []);
  

  return {
    login,
    startOTP,
    verifyOTP,
    load,
    logout,
  };
};

export default useAuth;

