import { Api } from "api";
import { FC, ReactNode } from "react";
import { SWRConfig } from "swr";

const SWRProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (url) => Api.get(url).then((res) => res.data),
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;
