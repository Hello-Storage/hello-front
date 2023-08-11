import { Api, setAuthToken } from "api";
import { GithubIcon } from "components";
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URL } from "config";
import { useAuth } from "hooks";
import { useEffect, useState } from "react";

const root_url = "https://github.com/login/oauth/authorize?";

const options = {
  client_id: GITHUB_CLIENT_ID,
  //   redirect_uri: GITHUB_REDIRECT_URL,
  //   scope: "user:email",
  //   state: "/login",
};

function openWindow(url: string, name: string, props: string) {
  var windowRef = window.open(url, name, props);
  if (windowRef && !windowRef.opener) {
    windowRef.opener = self;
  }
  windowRef?.focus();
  return windowRef;
}

export default function GithubLoginButton() {
  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    if (popup) {
      const currentURL = popup.location.href;
      const params = new URL(currentURL).searchParams;
      const code = params.get("code");
      console.log("currentURL", currentURL);

      console.log("code", code);

      //   popup.close();
    }
  }, [popup]);

  const onClick = () => {
    const width = 600;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const popup = window.open(
      root_url + new URLSearchParams(options),
      "_blank",
      `popup,width=${width},height=${height},left=${left},top=${top}`
    );
    setPopup(popup);
  };

  return (
    // <OauthPopup
    //   url="https://github.com/login/oauth/authorize?client_id=c50211fcfde1104ec365"
    //   onCode={onCode}
    //   onClose={onClose}
    //   title={"Login With Github"}
    //   width={600}
    //   height={700}
    // >
    <>
      <button
        //   href={root_url + new URLSearchParams(options)}
        className="w-full inline-flex items-center justify-center gap-4 rounded-xl p-3 bg-gray-100 hover:bg-gray-200"
        type="button"
        onClick={onClick}
      >
        <GithubIcon /> Connect with Github
      </button>
    </>

    // </OauthPopup>
  );
}
