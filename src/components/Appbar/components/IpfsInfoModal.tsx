import { Modal, useModal } from "components/Modal";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";
import { LuHelpCircle } from "react-icons/lu";
import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";


export const IpfsInfoModal = () => {
    const {lang} = useLanguage()
    const [, onDismiss] = useModal(<></>);

    const { theme } = useAppSelector((state) => state.user);

    return (
        <Modal className={"p-5 rounded-lg lg:ml-[288px]" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
            <div className={"rounded-lg relative modal-center " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                <p>
                    {/* When you enter <b>hello.app</b>, you automatically connect as an IPFS node on your browser. */}

                    {language[lang]["1151"]} <b>hello.app</b>, {language[lang]["1152"]}
                    <br />
                    <span className="text-orange-700">
                    {/* For now, file pinning is available only for public files (encrypted files are only decryptable through hello.app platform yet still on IPFS). Find more information about it below: */}
                    {language[lang]["1153"]} <i> {language[lang]["1154"]}</i> {language[lang]["1155"]}
                    </span>
                </p>
                <div className="w-full flex items-center justify-center p-2 my-2">
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                    >
                        <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href="https://docs.hello.app/ipfs/ipfs-gateway" target="_blank" >
                            <LuHelpCircle className="mr-3"></LuHelpCircle>{language[lang]["1156"]}
                        </a>
                    </button>
                </div>
                <div className="flex items-end justify-end">
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                        onClick={onDismiss}>
                        {/* Close */}
                        {language[lang]["062"]}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
