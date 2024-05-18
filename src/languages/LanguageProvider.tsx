/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from "react";

type Language = "en" | "es" | "it" | "de" | "pt" | "cn" | "ru" | "sa";

interface LanguageContextType {
  lang: Language;
  changeLanguage: (newLang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(localStorage.getItem("lang") as Language || "en");

  const changeLanguage = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
