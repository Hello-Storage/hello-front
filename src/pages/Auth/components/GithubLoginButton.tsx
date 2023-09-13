import { useState } from "react";
import { Api, setAuthToken } from "api";
import { GithubIcon } from "components";
import { GITHUB_CLIENT_ID } from "config";
import { useAuth } from "hooks";
import OauthPopup from "react-oauth-popup";
import * as Web3 from "web3";

const root_url = "https://github.com/login/oauth/authorize?";

const options = {
  client_id: GITHUB_CLIENT_ID,
  //   redirect_uri: GITHUB_REDIRECT_URL,
  //   scope: "user:email",
  //   state: "/login",
};

export default function GithubLoginButton() {
  const { load } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const onCode = async (code: string, params: any) => {
    const account = Web3.eth.accounts.create();
    const referrerCode = new URLSearchParams(window.location.search).get("ref");

    const baseParams = {
      code: code,
      wallet_address: account.address,
      private_key: account.privateKey,
    };

    const referrerParams = referrerCode ? { referrer_code: referrerCode } : {};

    const oauthResp = await Api.get("/oauth/github", {
      params: {
        ...baseParams,
        ...referrerParams,
      },
    });
    setAuthToken(oauthResp.data.access_token);
    load();
    setLoading(false);
  };
  const onClose = () => console.log("closed!");

  return (
    <OauthPopup
      url={root_url + new URLSearchParams(options)}
      onCode={onCode}
      onClose={onClose}
      title={"Login With Githuba"}
      width={600}
      height={700}
    >
      <button
        className="w-full inline-flex items-center justify-center gap-4 rounded-xl p-3 bg-gray-100 hover:bg-gray-200"
        type="button"
        onClick={() => setLoading(true)}
        disabled={loading ? true : false}
      >
        <GithubIcon /> {loading ? "Connecting..." : "Connect with Github"}
      </button>
    </OauthPopup>
  );
}
