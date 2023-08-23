import { useEffect } from "react";

const useDropdown = (
  ref: React.RefObject<HTMLDivElement>,
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onClose?: () => void
) => {
  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (open && ref?.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
      e.stopPropagation();
    };

    document.addEventListener("mouseup", checkIfClickedOutside);
    
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mouseup", checkIfClickedOutside);
    };
  }, [open, onClose]);
};

export default useDropdown;
