
import { motion } from "framer-motion";
import { navVariants } from "../../utils/one-page/motion";
import { Link } from "react-router-dom";

export const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className="p-8 relative z-10"
  >
    <div className="relative w-full flex justify-between items-start min-w-[350px]">
      <h1 className="text-2xl font-semibold text-white flex items-center font-[outfit]" title="hello app">
        {" "}
        hello.app
        <img
          src="https://hello.app/assets/beta-e8ce8431.png"
          width="48px"
          height="48px"
          alt="hello beta"
          className="ml-3"
        />
      </h1>
      <Link to="/space/login"
        title="Go to Login Page">
        <button
          type="button"
          className="md:px-10 md:py-3 py-2 px-6 bg-gradient-to-b from-violet-500 to-violet-800 hover:cursor-pointer rounded-xl hover:from-violet-600 hover:to-violet-900"
        >
          Launch app
        </button>
      </Link>
    </div>
  </motion.nav>
);
