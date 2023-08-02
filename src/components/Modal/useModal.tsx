import React, { useCallback, useContext } from "react";
import { Context } from "./Context";

const useModal = (
  modal: React.ReactNode,
  closeOnOverlayClick = true,
  renderOverlay = true
) => {
  const { onPresent, onDismiss } = useContext(Context);

  const onPresentCallback = useCallback(() => {
    onPresent(modal, closeOnOverlayClick, renderOverlay);
  }, [modal, onPresent, closeOnOverlayClick, renderOverlay]);

  return [onPresentCallback, onDismiss];
};

export default useModal;
