import { Modal, useModal } from "components/Modal";
import { FaDiscord } from "react-icons/fa";
import { useAppSelector } from "state";
import { Theme } from "state/user/reducer";
import { LuHelpCircle } from "react-icons/lu";

export const Support = () => {
    const [, onDismiss] = useModal(<></>);

    const { theme } = useAppSelector((state) => state.user);

    return (
        <Modal className={"p-5 rounded-lg lg:ml-[288px]" + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
            <div className={"rounded-lg relative modal-center " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                <p>If you have any type of problem or want to ask a question, open a ticket in our discord.
                </p>
                <div className="w-full flex items-center justify-center p-2 my-2">
                    <button
                        className={"text-blue-700 mr-3 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                    >
                        <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href="https://discord.com/invite/YnbGkSfUnM" target="_blank" >
                            <FaDiscord className="mr-3"></FaDiscord>Join to Discord
                        </a>
                    </button>
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                    >
                        <a className=" flex flex-row  items-center justify-center px-5 py-2.5" href="docs.hello.app/support" target="_blank" >
                            <LuHelpCircle className="mr-3"></LuHelpCircle>Learn about Tickets
                        </a>
                    </button>
                </div>
                <div className="flex items-end justify-end">
                    <button
                        className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
                            + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                        onClick={onDismiss}>
                            Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
