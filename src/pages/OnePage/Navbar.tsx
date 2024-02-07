
import { motion } from "framer-motion";
import { navVariants } from "../../utils/one-page/motion";

export const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className="p-8 relative z-10"
  >
    <div className="relative w-full flex justify-between">
      <p className="text-2xl font-semibold text-white flex items-center gap-2 font-[outfit]">
        {" "}
        hello.app
        <img
          src="https://hello.app/assets/beta-e8ce8431.png"
          width="48px"
          height="48px"
          alt="hello beta"
        />
      </p>
      <a href="/space/login">
        <button
          type="button"
          className="md:px-10 md:py-3 py-2 px-6 bg-gradient-to-b from-violet-500 to-violet-800 hover:cursor-pointer rounded-xl hover:from-violet-600 hover:to-violet-900"
        >
          Launch app
        </button>
      </a>
    </div>
  </motion.nav>
);
