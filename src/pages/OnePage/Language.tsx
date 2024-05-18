import React from "react";
import { useLanguage } from "../../languages/LanguageProvider";
type Language = "es" | "en"

export default function LanguageChange() {

    const { changeLanguage, lang } = useLanguage();

    const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        changeLanguage(e.currentTarget.value as Language);
    };

    return (
        <div className="flex justify-center items-center gap-5">
            <button onClick={onClickHandler} value="es" aria-pressed={lang === "es" ? "true" : "false"} className="text-black text-xs h-[24px] w-[24px] bg-yellow-300 rounded-full">Es</button>
            <button onClick={onClickHandler} value="en" aria-pressed={lang === "es" ? "true" : "false"} className="text-black text-xs h-[24px] w-[24px] bg-red-400 rounded-full">En</button>
        </div>
    )
}