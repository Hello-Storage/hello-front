import { Theme } from "state/user/reducer";
import language from "languages/languages.json"
import { useAppSelector } from "state";
import { useLanguage } from "languages/LanguageProvider";
import { Link } from "react-router-dom";
import React from "react";
type Language = "en" | "es" | "it" | "de" | "pt" | "cn" | "ru" | "sa";




export default function Settings() {
    const {changeLanguage, lang } = useLanguage()
    const { theme } = useAppSelector((state) => state.user);
    const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        changeLanguage(e.currentTarget.value as Language);
    };

    return (
        <div className="flex flex-col h-full relative">
            <Link
                to="/space/settings"
                className={"p-2 text-xl inline-flex items-center hover:text-blue-600 cursor-pointer"
                    + (theme === Theme.DARK ? " text-white " : " text-gray-700")}
            >
                {/* Settings */}
                {language[lang]["117"]}

            </Link>
            <hr className="mt-5 mb-3" />
            <div className="h-full p-8 flex flex-col items-center border rounded-xl">
                <div className="mb-4 flex flex-col items-start justify-start text-center w-full gap-5 space-x-2">
                    <h1 className={"md:text-lg text-lg select-none tracking-tighter text-start "
                        + (theme === Theme.DARK ? " text-white " : " text-gray-700")}>
                        {/* Choose your language */}
                        {language[lang]["1171"]}
                    </h1>
                    <div className="flex gap-3 w-full justify-center flex-wrap">
                        <button
                        onClick={onClickHandler}
                        value="en"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            English
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="es"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            Español
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="it"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            Italiano
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="de"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            Deutsch
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="pt"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            Português
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="cn"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  whitespace-nowrap items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            中国人
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="ru"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            Русский
                        </button>
                        <button
                        onClick={onClickHandler}
                        value="sa"
                            className={"flex flex-1 h-min justify-center min-w-[100px] max-w-[100px] w-[100px]  items-center gap-1 py-2 md:px-4 px-2 rounded-lg text-sm " +
                                (theme === Theme.DARK ? " dark-theme3" : "bg-gray-100 hover:bg-gray-200")}
                        >
                            
                            العربية
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}