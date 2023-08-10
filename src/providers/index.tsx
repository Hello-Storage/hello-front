import { FC, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { ModalProvider } from "components/Modal";

import state from "state";
import EthProvider from "./EthProvider";

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <Provider store={state}>
        <EthProvider>
          <ModalProvider>{children}</ModalProvider>
        </EthProvider>
      </Provider>

      {/* toast */}
      <ToastContainer position="bottom-left" theme="dark" closeOnClick />
    </>
  );
};

export default Providers;
