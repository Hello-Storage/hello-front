import { useGoogleLogin } from "@react-oauth/google";
import { AccountType, Api, setAuthToken } from "api";
import setAccountType from "api/setAccountType";
import { GoogleIcon } from "components";
import { useAuth } from "hooks";
import { useState } from "react";
import { Theme } from "state/user/reducer";
import { getTheme } from "utils/user";
import * as Web3 from "web3";
export default function GoogleLoginButton() {
  const { load } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const account = Web3.eth.accounts.create();
      const referrerCode = new URLSearchParams(window.location.search).get("ref");
      const referrerParams = referrerCode ? referrerCode : {};

      const Params = {
        code: tokenResponse.access_token,
        "wallet_address": account.address,
        "private_key": account.privateKey,
        "referrer_code": referrerParams,
      };

      console.log(Params);

      const oauthResp = await Api.get("/oauth/google", {
        params: Params,
      });
      setAuthToken(oauthResp.data.access_token);
      setAccountType(AccountType.Google);
      load();
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
    onNonOAuthError: () => {
      setLoading(false);
    },
  });

  return (
    <button
      className={"w-full inline-flex items-center justify-center gap-4 rounded-xl p-4 bg-gray-100 hover:bg-gray-200" + (getTheme() === Theme.DARK ? " dark-theme2" : "")}
      onClick={() => {
        setTimeout(() => { // this is to prevent the opened window from being hiden by the browser, it's a hack but it works (wtf XD)
          login();
        }, 500);
        setLoading(true);
      }}
      disabled={loading ? true : false}
    >
      <GoogleIcon />
      <p>
        {loading ? "Connecting..." : <span className="button-text-login">
        </span>}
        {" "}
        Google
      </p>
    </button>
  );
}
