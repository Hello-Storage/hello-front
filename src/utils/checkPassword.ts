const PASSWORD = import.meta.env.VITE_PASSWORD;

export const checkPassword = () => {
  const value = localStorage.getItem("joinhello");

  if (value === PASSWORD) {
    return true;
  }

  let psw = window.prompt("Please enter your password") ?? "";

  // const hash = stringHash(psw || '');
  if (psw !== PASSWORD) {
    checkPassword();
    return false;
  } else {
    localStorage.setItem("joinhello", psw!);
    return true;
  }
};
