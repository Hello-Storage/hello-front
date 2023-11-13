import { OTPModal } from "components";

import ConnectWalletButton from "./components/ConnectWalletButton";
import { useAppSelector } from "state";
import { Navigate } from "react-router-dom";
import { Spinner3 } from "components/Spinner";
import GoogleLoginButton from "./components/GoogleLoginButton";
import { useAuth } from "hooks";
import React, { useEffect, useState } from "react";
import { useModal } from "components/Modal";
import LogoHello from "assets/images/beta.png";
import useTitle from "hooks/useTitle";

import { HiMail } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { TbBrandTwitterFilled } from "react-icons/tb";
import { PiTiktokLogoFill } from "react-icons/pi";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { BsLinkedin } from 'react-icons/bs';
import { Api } from "api";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";

export default function Login() {
  useTitle("hello.app | Space");
  const { authenticated, loading, redirectUrl } = useAppSelector((state) => state.user);
  const [isRef, setIsRef] = useState(false);

  // Capture the ref query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsRef(params.get('ref') === 'ns');
  }, [location.search]);

  const { startOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [onPresent] = useModal(<OTPModal email={email} />);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const result = await startOTP(email);

    if (result) onPresent();
  };
  const [redirectMessage, setRedirectMessage] = useState("");

  const getRedirectMessage = async (url: string | undefined) => {
    if (url && url.includes("/shared/public")) {
      const share_hash = url.split("/").pop(); // assuming the CID is always the last part of the URL

      const res = await Api.get(`/file/share/published/name/${share_hash}`);

      let publishedFileName = "";
      if ((res as AxiosResponse).status === 200) {
        publishedFileName = res.data;
      }

      if ((res as unknown as AxiosError).isAxiosError) {
        toast.error("An error occured while fetching the file name");
        if ((res as unknown as AxiosError).response?.status === 404 || (res as unknown as AxiosError).response?.status === 503) {
          return;
        }
      }



      return setRedirectMessage(`Log in to view/download: ${publishedFileName}`);
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
    <div className="flex flex-col min-h-screen p-8 md:h-screen  justify-between">
      <div className="flex items-center gap-3">
        <label className="text-2xl font-semibold font-[Outfit]">
          hello.app
        </label>
        <img src={LogoHello} alt="logo" className="w-12 h-6" />
      </div>
      {redirectMessage && <p>{redirectMessage}</p>}

      <div className="flex flex-col md:flex-row gap-8 md:gap-0 h-full">
        <div className="flex items-center justify-center flex-1">
          <div className="md:min-w-[400px] mt-12 md:mt-0">
            <h1 className="text-center text-4xl font-semibold tracking-tighter">
              Welcome 👋
            </h1>
            <h3 className="text-center text-lg mt-4 tracking-tighter">
              Select your favorite login option
            </h3>
            <h3 className="text-center text-lg mt-4 tracking-tighter">
             Get your <b>100GB</b> free storage now! 
            </h3>

            <div className="mt-12 flex gap-[15px] flex-col justify-around">
              <GoogleLoginButton />
              <ConnectWalletButton />
            </div>

            <div className="inline-flex items-center justify-center w-full relative">
              <hr className="w-full h-px my-8 bg-gray-200 border-0" />
              <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2">
                Or
              </span>
            </div>

            {/* login with email */}
            <form onSubmit={onSubmit}>
              <div className="">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-600"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-full px-2.5 py-4"
                  placeholder="example@email.com"
                  value={email}
                  onChange={onChange}
                  required
                />

                <div className="mt-[15px]">
                  <button
                    className="w-full inline-flex items-center justify-center text-white px-3 py-4 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                    type="submit"
                  >
                    Send a magic link ✨
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <footer className="text-sm text-black md:mx-12 mt-8 p-0 md:p-2">
        <div className="flex flex-col items-start">
          <div className="flex space-x-4 p-0 md:p-0">
            <a href="mailto:team@hello.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
              <HiMail />
            </a>
            <a href="https://www.linkedin.com/company/hellostorage" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px' }}>
              <BsLinkedin />
            </a>
            <a href="https://github.com/hello-storage" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
              <FaGithubSquare />
            </a>

            <a href="https://twitter.com/joinhelloapp" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
              <TbBrandTwitterFilled />
            </a>
            <a href="https://www.instagram.com/joinhelloapp/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
              <BiLogoInstagramAlt />
            </a>
            <a href="https://www.tiktok.com/@hello.app_" target="_blank" rel="noopener noreferrer" style={{ fontSize: '15px' }}>
              <PiTiktokLogoFill />
            </a>
          </div>
          <div className="mt-1 md:mt-1">
            © 2023 hello.app
          </div>
        </div>
      </footer>
    </div >
  );
}
