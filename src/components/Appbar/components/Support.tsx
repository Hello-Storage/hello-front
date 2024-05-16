import { Modal, useModal } from "components/Modal";
import { FaDiscord } from "react-icons/fa";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";
import { LuHelpCircle } from "react-icons/lu";
import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";


export const Support = () => {
    const {lang} = useLanguage()
    const [, onDismiss] = useModal(<></>);

    const { theme } = useAppSelector((state) => state.user);

    return (
        <Modal className={"p-5 rounded-lg lg:ml-[288px]" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
            <div className={"rounded-lg relative modal-center " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                <p>
                    {/* If you have any type of problem or want to ask a question, open a ticket in our discord. */}
                    {language[lang]["1131"]}
                </p>
                <div className="w-full flex items-center justify-center p-2 my-2">
                    <button
                        className={"text-blue-700 mr-3 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                    >
                        <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href="https://discord.com/invite/YnbGkSfUnM" target="_blank" >
                            <FaDiscord className="mr-3"></FaDiscord>
                            {/* Join to Discord */}
                            {language[lang]["1132"]}
                        </a>
                    </button>
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                    >
                        <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href="https://docs.hello.app/support" target="_blank" >
                            <LuHelpCircle className="mr-3"></LuHelpCircle>
                            {/* Learn about Tickets */}
                            {language[lang]["1133"]}
                        </a>
                    </button>
                </div>
                <div className="flex items-end justify-end">
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                        onClick={onDismiss}>
                            {/* Close */}
                            {language[lang]["1134"]}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
