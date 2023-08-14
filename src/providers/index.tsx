import { FC, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { ModalProvider } from "components/Modal";

import state from "state";
import EthProvider from "./EthProvider";
import GoogleOAuth from "./GoogleOAuthProvider";

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <Provider store={state}>
        <GoogleOAuth>
          <EthProvider>
            <ModalProvider>{children}</ModalProvider>
          </EthProvider>
        </GoogleOAuth>
      </Provider>

      {/* toast */}
      <ToastContainer position="bottom-right" theme="colored" closeOnClick />
    </>
  );
};

export default Providers;
