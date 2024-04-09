
import { useEffect, useRef, useState } from "react";
import Button3D from "../../../assets/one-page/Button3D.svg"


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
    <section className="relative flex flex-col justify-center h-screen items-center mx-8 top-[-154px] md:top-[-104px]">
      <div className="seo-helper">
        Hello.app: Revolutionizing Data Storage with Blockchain and Decentralization

        In the ever-evolving digital landscape, hello.app emerges as a groundbreaking solution for data storage. Developed by Álvaro Pintado Santaularia and Alexander Baikalov, this innovative software combines blockchain technology with decentralized storage infrastructures. Let’s delve into the details of this transformative platform:

        The Birth of hello.app:
        The recent beta launch of hello.app marks a significant advancement in the realm of digital storage1. Unlike traditional centralized cloud services, hello.app takes a bold step toward decentralization.
        Decentralized Control:
        hello.app is the world’s first user-controlled, open-source decentralized storage software of Web3. It empowers users by giving them direct control over their data2.
        As part of its launch campaign, hello.app offers new users 100GB of free storage2.
        The Blockchain Connection:
        hello.app leverages the security and transparency of blockchain technology. By distributing data across a network of nodes, it ensures redundancy and resilience.
        Users’ files are encrypted, fragmented, and stored across multiple nodes, making it virtually impossible for a single point of failure to compromise data integrity.
        Unicorn Ambitions:
        Álvaro Pintado, co-founder and CEO of hello.app, envisions the platform as a future unicorn. The goal? To achieve a valuation of one trillion euros within the next three years3.
        User Experience:
        The straightforward interface of hello.app makes it easy for users to store and retrieve their files. No complex algorithms decide who gets access; everyone has a chance4.
        Whether you’re an individual, a business, or a developer, hello.app offers unlimited access without restrictions.
        Audio and Video Calls:
        Beyond storage, hello.app facilitates communication. Users can engage in audio and video calls with friends and contacts, ensuring seamless collaboration.
        Expressing Emotions:
        hello.app allows users to convey emotions through GIFs and animated emojis. It’s not just about data; it’s about connecting on a human level.
        The Domain Acquisition:
        Álvaro Pintado made a bold move by acquiring the domain hello.app for €107,000. This decision, initially met with skepticism, ultimately boosted the company’s visibility and user acquisition3.
        Unlimited Potential:
        In an era where data is as valuable as gold, hello.app aims to revolutionize how we store and interact with information. It’s not just a storage solution; it’s a gateway to sensational conversations and connections5.
        The Challenge to Giants:
        By challenging established cloud giants, hello.app disrupts the status quo. It champions user empowerment, privacy, and security.
        The Unpredictable Conversations:
        When you use hello.app, you never know whom you’ll end up talking to. It’s a thrilling journey where conversations unfold unexpectedly.
        The 100GB Gift:
        New users receive 100GB of free storage—a generous offer that encourages exploration and adoption.
        The Road Ahead:
        As hello.app gains traction, it aims to redefine how we perceive data storage. It’s not just about files; it’s about freedom.
        Join the Conversation:
        Download hello.app, connect with others, and experience the future of decentralized storage firsthand.
        Conclusion:
        hello.app isn’t just an app; it’s a movement. It invites us to rethink data ownership, privacy, and connectivity. So, say hello to a decentralized future!
      </div>

      <div className="max-w-3xl flex flex-col md:gap-10 gap-5 justify-center text-center mb-8 one-page-btn">
        <h2 className="font-extrabold tracking-tight text-white one-page-title text-center">
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
              src={Button3D}
              alt="Upload Box"
              className="w-[21vh] h-[20vh] md:w-[26vh] md:h-[25vh] rounded-[2rem]"
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
  );
};

export default Hero;
