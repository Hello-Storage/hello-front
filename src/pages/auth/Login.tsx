import { GithubIcon, GoogleIcon, LogoIcon } from "components";

import shows from "@images/auth/shows.png";
import ConnectWalletButton from "./components/ConnectWalletButton";

export default function Login() {
  return (
    <div className="p-8 h-screen">
      <div className="md:absolute flex items-center gap-2">
        <LogoIcon />
        <label className="text-3xl font-semibold">Hello</label>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-0 h-full">
        <div className="flex items-center justify-center flex-1">
          <div className="md:min-w-[400px] mt-12 md:mt-0">
            <h1 className="text-4xl font-semibold">Welcome 👋</h1>
            <h3 className="text-lg mt-4">Select your favorite login option</h3>

            <div className="mt-12">
              <ConnectWalletButton />
            </div>

            <hr className="my-5" />

            {/* login with email */}
            <form>
              <div className="">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="example@email.com"
                  required
                />

                <div className="mt-6">
                  <button className="w-full inline-flex items-center justify-center text-white p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800">
                    Receive a magic link ✨
                  </button>
                </div>
              </div>
            </form>

            <div className="inline-flex items-center justify-center w-full relative">
              <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
              <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
                Or
              </span>
            </div>

            {/* connect with google */}
            <div className="mt-6">
              <button className="w-full inline-flex items-center justify-center gap-4 rounded-xl p-3 bg-gray-100 hover:bg-gray-200">
                <GoogleIcon />
                Connect with Google
              </button>
            </div>

            {/* connect with github */}
            <div className="mt-6">
              <button className="w-full inline-flex items-center justify-center gap-4 rounded-xl p-3 bg-gray-100 hover:bg-gray-200">
                <GithubIcon /> Connect with Github
              </button>
            </div>
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
