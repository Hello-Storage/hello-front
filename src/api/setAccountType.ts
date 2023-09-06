
const setAccountType = (accountType?: string) => {
  if (accountType) {
    localStorage.setItem("account_type", accountType);
  } else {
    localStorage.removeItem("account_type");
  }
};

export default setAccountType;
