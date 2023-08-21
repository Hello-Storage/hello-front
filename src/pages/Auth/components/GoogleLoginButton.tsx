import { useGoogleLogin } from "@react-oauth/google";
import { Api, setAuthToken } from "api";
import { GoogleIcon } from "components";
import { useAuth } from "hooks";
import { useState } from "react";

export default function GoogleLoginButton() {
  const { load } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const oauthResp = await Api.get("/oauth/google", {
        params: {
          code: tokenResponse.access_token,
        },
      });
      setAuthToken(oauthResp.data.access_token);

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
