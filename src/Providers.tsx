import { FC, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";

import { ModalProvider } from "components/Modal";

import state from "state";

const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <Provider store={state}>
        <ModalProvider>{children}</ModalProvider>
      </Provider>
      <ToastContainer position="bottom-left" theme="dark" closeOnClick />
    </>
  );
};

export default Providers;
