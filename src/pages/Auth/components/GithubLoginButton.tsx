import { useState } from "react";
import { Api, setAuthToken } from "api";
import { GithubIcon } from "components";
import { GITHUB_CLIENT_ID } from "config";
import { useAuth } from "hooks";
import OauthPopup from "react-oauth-popup";
import setAccountType from "api/setAccountType";

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
    const oauthResp = await Api.get("/oauth/github", {
      params: {
        code: code,
      },
    });
    setAuthToken(oauthResp.data.access_token);
    load();
    setLoading(false);
    setAccountType("google");
  };
  const onClose = () => console.log("closed!");

  return (
    <OauthPopup
      url={root_url + new URLSearchParams(options)}
      onCode={onCode}
      onClose={onClose}
      title={"Login With Github"}
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
