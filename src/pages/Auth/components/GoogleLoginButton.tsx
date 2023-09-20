import { useGoogleLogin } from "@react-oauth/google";
import { AccountType, Api, setAuthToken } from "api";
import setAccountType from "api/setAccountType";
import { GoogleIcon } from "components";
import { useAuth } from "hooks";
import { useState } from "react";
import { toast } from "react-toastify";
import * as Web3 from "web3";
export default function GoogleLoginButton() {
  const { load } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const account = Web3.eth.accounts.create();
      const referrerCode = new URLSearchParams(window.location.search).get("ref");

      const baseParams = {
        code: tokenResponse.access_token,
        wallet_address: account.address,
        private_key: account.privateKey,
      };

      const referrerParams = referrerCode ? { referrer_code: referrerCode } : {};
      const oauthResp = await Api.get("/oauth/google", {
        params: {
          ...baseParams,
          ...referrerParams,
        },
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
      className="w-full inline-flex items-center justify-center gap-4 rounded-xl p-3 bg-gray-100 hover:bg-gray-200"
      onClick={() => {
        login();
        setLoading(true);
      }}
      disabled={loading ? true : false}
    >
      <GoogleIcon />
      {loading ? "Connecting..." : "Connect with Google"}
    </button>
  );
}
