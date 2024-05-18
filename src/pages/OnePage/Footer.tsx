import { BiLogoInstagramAlt } from "react-icons/bi";
import { BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { PiTiktokLogoFill } from "react-icons/pi";
import { TbBrandTwitterFilled } from "react-icons/tb";
import language from "../../languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";


export const Footer = () => {

  const {lang} = useLanguage()

  return(
  <footer className="flex flex-row justify-between md:p-2 z-0 text-sm text-white md:mb-0 mt-8 absolute inset-x-0 bottom-[132px] md:bottom-[32px] left-8 right-8 md:left-20 md:right-8 min-w-[350px]">
    <div className="flex flex-col items-start">
      <div className="flex p-0 space-x-4 md:p-0">
        <a
          title="Email us"
          href="mailto:team@hello.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "16px" }}
        >
          <HiMail />
        </a>
        <a
          title="Join us on LinkedIn"
          href="https://www.linkedin.com/company/hellostorage"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "14px" }}
        >
          <BsLinkedin />
        </a>
        <a
          title="Join us on GitHub"
          href="https://github.com/hello-storage"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "15px" }}
        >
          <FaGithubSquare />
        </a>

        <a
          title="Join us on Twitter"
          href="https://twitter.com/joinhelloapp"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "15px" }}
        >
          <TbBrandTwitterFilled />
        </a>
        <a
          title="Join us on Instagram"
          href="https://www.instagram.com/joinhelloapp/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "16px" }}
        >
          <BiLogoInstagramAlt />
        </a>
        <a
          title="Join us on TikTok"
          href="https://www.tiktok.com/@joinhelloapp"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "15px" }}
        >
          <PiTiktokLogoFill />
        </a>
      </div>
      <div className="flex flex-col mt-1 md:mt-1">
        © 2024 hello.app
      </div>
    </div>
    <div className="flex flex-col items-start">
      <a
        title="Privacy Policy"
        href="https://hello.app/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "15px" }}
      >
        <div className="flex flex-col mt-1 md:mt-1 mr-4">
        {/* Privacy Policy */}
          {language[lang]["04"]}
        </div>
      </a>
    </div>
  </footer>
)}

export default Footer;
