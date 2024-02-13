
import { useEffect, useRef, useState } from "react";

export const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const uploadRef = useRef<HTMLDivElement>(null);
  // const [dragging, setDragging] = useState(false);

  const handleSubmit = async (event: any) => {
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

  useEffect(() => {
    const handleMouseMove = (event: any) => {
      const uploadDiv = uploadRef.current;
      if (uploadDiv) {
        const x = (event.clientX / window.innerWidth) * 50;
        const y = (event.clientY / window.innerHeight) * 50;
        uploadDiv.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Drag and drop functionality
  const handleDragOver = (e: any) => {
    e.preventDefault();
    // setDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    // setDragging(false);
  };

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    // setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // handle the files
      console.log(e.dataTransfer.files);
    }
  };


  return (
    <div>
      <div
        className="absolute pointer-events-none	 bottom-0 left-20 z-0 rotate-180 -translate-x-3/4 -scale-x-100 blur-3xl opacity-80"
        aria-hidden="true"
      >
        <img
          src="https://media.publit.io/file/shape.svg"
          className="max-w-none sm:w-auto w-2/3"
          width="1080"
          height="582"
          alt="Illustration"
        />
      </div>

      <div
        className="absolute pointer-events-none	 top-0 -right-32 z-0 -translate-y-1/2 translate-x-1/4 blur-3xl opacity-80"
        aria-hidden="true"
      >
        <img
          src="https://media.publit.io/file/shape.svg"
          className="max-w-none sm:w-auto w-2/3"
          width="1180"
          height="582"
          alt="Illustration"
        />
      </div>
      <section className="relative flex flex-col justify-center h-screen items-center mx-8 top-[-104px]">
        <div className="max-w-3xl flex flex-col md:gap-10 gap-5 justify-center text-center mb-8 one-page-btn">
          <h2 className="font-extrabold tracking-tight text-white md:text-6xl text-4xl text-center antialiased">
            Dream with us{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500/80 to-sky-500/80">
              upload anything you want
            </span>
          </h2>

        </div>
        <div
          ref={uploadRef}
          className="group relative cursor-pointer pointer-events-auto"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <div className="relative translate-z-10">
            <a href="/space/login">
              <img
                src="https://media.publit.io/file/3Dbox.svg"
                alt="Upload Box"
                className="w-[150px] h-[150px] md:w-[280px] md:h-[260px] rounded-[2rem]"
              />
              <div className="absolute w-[90%] h-[90%] inset-0 rainbow-border 
            opacity-0 group-hover:opacity-100 transform group-hover:scale-90"></div>{" "}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 md:my-16 my-8">
          <a href="https://docs.hello.app/" 
          title="Read the Documentation"
          className="relative px-12 py-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-900 hover:from-violet-600 hover:to-violet-900 cursor-pointer inline-block">
            <span className="relative z-10 text-white">About</span>
            <div className="absolute inset-0 rounded-xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25"></div>
          </a>
          <a href="/space/login" 
          title="Go to Login Page"
          className="relative px-12 py-3 bg-gradient-to-b from-violet-500 to-violet-800 hover:from-violet-600 hover:to-violet-900 rounded-xl cursor-pointer inline-block">
            <span className="relative z-10 text-white">Enter</span>
            <div className="absolute inset-0 rounded-xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25"></div>
          </a>
        </div>
        {showModal && (
          <div className="inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75" />
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-black-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-300">
                    Enter your email
                  </h3>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center"
                  >
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-white bg-gray-800 rounded-lg border border-gray-700 my-4 p-2 w-full sm:w-2/3"
                    />
                    <button
                      type="submit"
                      className="pointer-events-auto relative overflow-hidden rounded-lg bg-black px-24 py-6 ring-red-500/50 ring-offset-black will-change-transform focus:outline-none focus:ring-1 focus:ring-offset-2"
                    >
                      <span className="absolute inset-px z-10 grid place-items-center rounded-lg bg-black bg-gradient-to-t from-neutral-800 text-white-400">
                        Submit
                      </span>
                      <span
                        aria-hidden
                        className="absolute inset-0 z-0 scale-x-[2.0] blur before:absolute before:inset-0 before:top-1/2 before:aspect-square before:animate-disco before:bg-gradient-conic before:from-violet-700 before:via-pink-500 before:to-green-400"
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
    </div>
  );
};

export default Hero;
