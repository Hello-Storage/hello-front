import { FC, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { ModalProvider } from "components/Modal";

import state, { persistor } from "state";
import EthProvider from "./EthProvider";
import GoogleOAuth from "./GoogleOAuthProvider";
import SWRProvider from "./SWRProvider";
import { PersistGate } from "redux-persist/integration/react";

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <Provider store={state}>
        <PersistGate loading={null} persistor={persistor}>
          <GoogleOAuth>
            <EthProvider>
              <SWRProvider>
                <ModalProvider>{children}</ModalProvider>
              </SWRProvider>
            </EthProvider>
          </GoogleOAuth>
        </PersistGate>
      </Provider>

      {/* toast */}
      <ToastContainer style={{ marginTop: "10px" }} position="top-right" theme="colored" closeOnClick />
    </>
  );
};

export default Providers;
