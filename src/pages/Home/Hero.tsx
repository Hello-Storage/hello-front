
import React from "react";
import ThreeDScene from "./hello3d";
import "./styles/globals.css"
import { useAppSelector } from "state";
import { Navigate } from "react-router";

const Hero = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    try {
      const response = await fetch("https://ounn.space/email/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };
  const { authenticated, } = useAppSelector((state) => state.user);
  
  if (authenticated) {
    return <Navigate to="/space/my-storage" />;
  }

  return (
    <section className="relative h-screen">
      <div className="absolute inset-0 z-10 -mt-40 md:mt-0">
        <ThreeDScene />
      </div>
      <div
        className="absolute inset-0 z-20 px-6 flex flex-col justify-center mt-40 md:justify-end items-center pointer-events-none"
        style={{ paddingBottom: "17vh" }}
      >
        <div className="max-w-lg mx-auto p-6 shadow-lg bg-black rounded-2xl border border-gray-700 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <h1 className="mb-2 text-lg text-gray-300 text-center">
              For decades, the internet has been controlled and monopolized by
              very few tech giants.{" "}
              <br />
              <span className="italic">"Our data is our asset, not theirs."</span>
            </h1>
            <p className="text-white text-xl mb-6 font-medium text-center">
              Secure and control your storage
            </p>
          </div>

          <div className="flex flex-col justify-center items-center mb-6">
            <button type="button" onClick={() => setShowModal(true)} className="pointer-events-auto relative mb-2 overflow-hidden rounded-lg bg-black px-24 py-6 ring-red-500/50 ring-offset-black will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2 cursor-emoji">
              <span className="absolute inset-px z-10 grid place-items-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-400">
                Know more
              </span>
              <span
                aria-hidden
                className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-700 before:via-pink-500 before:to-green-400"
              />
            </button>
              <button type="button" onClick={() => window.location.href = window.location + "space/login"} className="pointer-events-auto relative overflow-hidden rounded-lg bg-black px-24 py-6 ring-red-500/50 ring-offset-black will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2 cursor-emoji">
              <span className="absolute inset-px z-10 grid place-items-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-neutral-400">
                <b>Join beta</b>
              </span>
              <span
                aria-hidden
                className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-700 before:via-pink-500 before:to-green-400"
              />
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-black-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-300">Enter your email</h3>
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-white bg-gray-800 rounded-lg border border-gray-700 my-4 p-2 w-full sm:w-2/3"
                  />
                  <button type="submit" className="pointer-events-auto relative overflow-hidden rounded-lg bg-black px-24 py-6 ring-red-500/50 ring-offset-black will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2">
                    <span className="absolute inset-px z-10 grid place-items-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-white-400">
                      Submit
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-purple-700 before:via-pink-500 before:to-green-400"
                    />
                  </button>
                </form>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-800 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
