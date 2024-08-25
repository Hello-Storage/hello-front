import { Theme } from "state/user/reducer";
import language from "languages/languages.json";
import { useAppSelector } from "state";
import { useLanguage } from "languages/LanguageProvider";
import { Link } from "react-router-dom";
import { TerminalCopyContainer } from "./components/TerminalCopyContainer/TerminalCopyContainer";

export default function Profile() {
  const { lang } = useLanguage();
  const { theme, uid } = useAppSelector((state) => state.user);
  const { userID } = useAppSelector((state) => state.userdetail);

  return (
    <div className="flex flex-col h-full relative">
      <Link
        to="/space/profile"
        className={
          "p-2 text-xl inline-flex items-center hover:text-blue-600 cursor-pointer" +
          (theme === Theme.DARK ? " text-white " : " text-gray-700")
        }
      >
        {language[lang]["116"]}
      </Link>
      <hr className="mt-5 mb-3" />
      <div className="h-full p-8 flex flex-col items-center border rounded-xl">
        <div className="mb-4 flex flex-col items-start justify-start text-center w-full gap-5 space-x-2">
          <h2>Support</h2>
          <p>{language[lang]["1158"]}</p>
          <TerminalCopyContainer contentToCopy={`uid: ${uid} %userID: ${userID} %userAgent: ${navigator.userAgent}`} />
        </div>
      </div>
    </div>
  );
}
