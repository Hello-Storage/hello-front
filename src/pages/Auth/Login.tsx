import { LogoIcon, OTPModal } from "components";

import shows from "@images/auth/shows.png";
import ConnectWalletButton from "./components/ConnectWalletButton";
import { useAppSelector } from "state";
import { Navigate } from "react-router-dom";
import { Spinner3 } from "components/Spinner";
import GoogleLoginButton from "./components/GoogleLoginButton";
import GithubLoginButton from "./components/GithubLoginButton";
import { useAuth } from "hooks";
import React, { useState } from "react";
import { useModal } from "components/Modal";
import LogoHello from "assets/images/beta.png";
import useTitle from "hooks/useTitle";

export default function Login() {
  useTitle("hello.app | Space");
  const { authenticated, loading } = useAppSelector((state) => state.user);
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
    console.log(result);

    if (result) onPresent();
  };

  if (loading) return <Spinner3 />;
  if (authenticated) {
    const newUrl = new URL("/space/my-storage", window.location.origin);
    return window.location.href = newUrl.href;
  }

  return (
    <div className="p-8 md:h-screen">
      <div className="md:absolute flex items-center gap-2">
        <div className="flex items-center gap-3">
          <label className="text-2xl font-semibold font-[Outfit]">
            hello.app
          </label>
          <img src={LogoHello} alt="logo" className="w-12 h-6" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-0 h-full">
        <div className="flex items-center justify-center flex-1">
          <div className="md:min-w-[400px] mt-12 md:mt-0">
            <h1 className="text-4xl font-semibold tracking-tighter">
              Welcome 👋
            </h1>
            <h3 className="text-lg mt-4 tracking-tighter">
              Select your favorite login option
            </h3>

            <div className="mt-12 flex gap-4 flex-col">
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
                  type="email"
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-full px-2.5 py-4"
                  placeholder="example@email.com"
                  value={email}
                  onChange={onChange}
                  required
                />

                <div className="mt-6">
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

        <div
          className={`flex items-center flex-1 bg-[url('/images/login-bg.jpg')] bg-cover rounded-[40px]`}
        >
          <div className="w-full p-6 md:p-0">
            <img className="mx-auto" src={shows} alt="shows" />

            <div className="text-center mt-16">
              <label className="text-white text-xl font-medium">
                Keep your data safe.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
