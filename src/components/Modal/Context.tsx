import {
  createContext,
  FC,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { opacity } from "utils/framerAnimations";

interface ModalContext {
  isOpen: boolean;
  modalNode: React.ReactNode;
  setModalNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  onPresent: (
    node: React.ReactNode,
    closeOverlayClick: boolean,
    renderOverlay: boolean
  ) => void;
  onDismiss: () => void;
}

export const Context = createContext<ModalContext>({
  isOpen: false,
  modalNode: null,
  setModalNode: () => null,
  onPresent: () => null,
  onDismiss: () => null,
});

const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalNode, setModalNode] = useState<React.ReactNode>();

  const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
  const [renderOverlay, setRenderOverlay] = useState(true);

  const handlePresent = (
    node: React.ReactNode,
    closeOverlayClick: boolean,
    renderOverlay: boolean
  ) => {
    setModalNode(node);
    setIsOpen(true);

    setCloseOnOverlayClick(closeOverlayClick);
    setRenderOverlay(renderOverlay);
  };

  const handleDismiss = useCallback(() => {
    setModalNode(undefined);
    setIsOpen(false);

    setCloseOnOverlayClick(true);
    setRenderOverlay(true);
  }, []);

  const handleOverlayDismiss = useCallback(() => {
    if (closeOnOverlayClick) {
      handleDismiss();
    }
  }, [closeOnOverlayClick, handleDismiss]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        handleOverlayDismiss();
      }
    },
    [handleOverlayDismiss]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <Context.Provider
      value={{
        isOpen,
        modalNode,
        setModalNode,
        onPresent: handlePresent,
        onDismiss: handleDismiss,
      }}
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {isOpen && (
            <m.div
              className="modal-wrapper"
              aria-modal
              aria-hidden
              tabIndex={-1}
              role="dialog"
              variants={opacity}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderOverlay && (
                <div className="modal-overlay" onClick={handleOverlayDismiss} />
              )}
              {modalNode}
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
      {children}
    </Context.Provider>
  );
};

export default ModalProvider;
