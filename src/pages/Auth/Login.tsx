import { OTPModal } from "components";


import language from "../../languages/es.json"
import { useLanguage } from "languages/LanguageProvider";


import ConnectWalletButton from "./components/ConnectWalletButton";
import { useAppSelector } from "state";
import { Navigate } from "react-router-dom";
import { Spinner3 } from "components/Spinner";
import GoogleLoginButton from "./components/GoogleLoginButton";
import { useAuth } from "hooks";
import React, { useEffect, useState } from "react";
import { useModal } from "components/Modal";
import LogoHello from "assets/images/beta.png";

import { HiMail } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { TbBrandTwitterFilled } from "react-icons/tb";
import { PiTiktokLogoFill } from "react-icons/pi";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { BsLinkedin } from 'react-icons/bs';
import { Api } from "api";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { getTheme } from "utils/user";
import { Theme } from "state/user/reducer";

import { Helmet } from 'react-helmet';

export default function Login() {
  const {lang} = useLanguage()

  const { authenticated, loading, redirectUrl } = useAppSelector((state) => state.user);

  const { startOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [onPresent] = useModal(<OTPModal email={email} />);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    toast.info("Sending OTP...");
    const result = await startOTP(email);

    if (result) onPresent();
  };
  const [redirectMessage, setRedirectMessage] = useState("");

  const getRedirectMessage = async (url: string | undefined) => {
    if (url?.includes("/shared/public")) {
      const share_hash = url.split("/").pop(); // assuming the CID is always the last part of the URL

      const res = await Api.get(`/file/share/published/name/${share_hash}`);

      let publishedFileName: any = {};
      if (res.status === 200) {
        publishedFileName = res.data;
      }

      if ((res as unknown as AxiosError).isAxiosError) {
        toast.error("An error occured while fetching the file name");
        if ((res as unknown as AxiosError).response?.status === 404 || (res as unknown as AxiosError).response?.status === 503) {
          return;
        }
      }

      let newFilename = publishedFileName.name;
      if (publishedFileName.name === undefined || publishedFileName.name === "") {
        if (publishedFileName.file_share_state.public_file.name !== undefined && publishedFileName.file_share_state.public_file.name !== "") {
          newFilename = publishedFileName.file_share_state.public_file.name;
        } else {
          newFilename = publishedFileName.file_share_states_user_shared.public_files_user_shared.name;
        }
      }
      return setRedirectMessage(`Login to view/download: ${newFilename}`);
    }
    return setRedirectMessage("");
  };

  useEffect(() => {
    getRedirectMessage(redirectUrl);
  }, [redirectUrl]);

  if (loading) return <Spinner3 />;
  if (authenticated) {
    return redirectUrl ? <Navigate to={redirectUrl} /> : <Navigate to="/space/my-storage" />;
  }

  return (
    <>
      <Helmet>
        <title>Login | hello.app</title>
        <meta name="description" content="Create an account or login to hello.app" />
        <link rel="canonical" href="https://hello.app/space/login" />
      </Helmet>
      <div className={"flex flex-col justify-between min-h-screen p-8 md:h-screen" + (getTheme() === Theme.DARK ? " dark-theme" : "")}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold font-[Outfit]">
            hello.app
          </h1>
          <img src={LogoHello} alt="logo" className="w-12 h-6" />
        </div>
        {redirectMessage && <p>{redirectMessage}</p>}

        <div className="flex flex-col h-full gap-8 md:flex-row md:gap-0">
          <div className="flex items-center justify-center flex-1">
            <div className="md:min-w-[400px] md:mt-0">
              <h2 className="text-4xl font-semibold tracking-tighter text-center">
              {/* Welcome */}
              {language[lang]["021"]} 👋
              </h2>
              <h3 className="block mt-4 text-lg tracking-tighter text-center">
              {/* Select your favorite login option */}
              {language[lang]["022"]}
              </h3>
              <h3 className="hidden mt-4 text-lg tracking-tighter text-center md:block">
                {/* Get your /// 100gb /// free storage now! */}
              {language[lang]["023"]} <b>{language[lang]["0232"]}</b> {language[lang]["0231"]}
              </h3>

              <div className="mt-[20px] flex-login-btns gap-[15px] justify-around">
                <GoogleLoginButton />
                <ConnectWalletButton />
              </div>

              <div className="relative inline-flex items-center justify-center w-full">
                <hr className="w-full h-px my-8 bg-gray-200 border-0" />
                <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 rounded-xl">
                {/* Or */}
                {language[lang]["024"]}
                </span>
              </div>

              {/* login with email */}
              <form onSubmit={onSubmit}>
                <div className="">
                  <label
                    htmlFor="email"
                    className={"block mb-2 text-sm font-medium " + (getTheme() === Theme.DARK ? " dark-theme" : "text-gray-600")}
                  >
                    {/* Email address */}
                    {language[lang]["025"]}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={"bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-full px-2.5 py-4"
                      + (getTheme() === Theme.DARK ? " dark-theme3" : "")}
                    placeholder="example@email.com"
                    value={email}
                    onChange={onChange}
                    required
                  />

                  <div className="mt-[15px]">
                    <button
                      className="inline-flex items-center justify-center w-full px-3 py-4 text-white rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                      type="submit"
                    >
                      {/* Send a magic link */}
                      {language[lang]["026"]} ✨
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <footer className={"p-0 min-w-[350px] text-sm flex justify-between flex-row items-center text-black md:mx-12 md:p-2 mb-[100px] md:mb-0" + (getTheme() === Theme.DARK ? " dark-theme" : "")}>
          <div className="flex flex-col items-start">
            <div className="flex p-0 space-x-4 md:p-0">
              <a href="mailto:team@hello.app"
                title="Email us" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
                <HiMail />
              </a>
              <a href="https://www.linkedin.com/company/hellostorage"
                title="Join us on LinkedIn"
                target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px' }}>
                <BsLinkedin />
              </a>
              <a href="https://github.com/hello-storage"
                title="Join us on GitHub"
                target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
                <FaGithubSquare />
              </a>

              <a href="https://twitter.com/joinhelloapp"
                title="Join us on Twitter"
                target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
                <TbBrandTwitterFilled />
              </a>
              <a href="https://www.instagram.com/joinhelloapp/"
                title="Join us on Instagram"
                target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
                <BiLogoInstagramAlt />
              </a>
              <a href="https://www.tiktok.com/@hello.app_"
                title="Join us on TikTok"
                target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
                <PiTiktokLogoFill />
              </a>
            </div>
            <div className="flex flex-col mt-1 md:mt-1">
              <a href="https://docs.hello.app/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
              {/* More information here */}
              {language[lang]["027"]}
              </a>
              © {new Date().getFullYear()} hello.app
            </div>
          </div>
          <div className="mt-1 md:mt-1 flex flex-col text-right">
            <a href="https://hello.app/privacy-policy"
              title="Privacy Policy"
              target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
                {/* Privacy Policy */}
              {language[lang]["04"]}
            </a>
          </div>
        </footer>
      </div >
    </>
  );
}
