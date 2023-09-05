// store personalSignature in SS and set axios headers if we do have a token

const setPersonalSignature = (personalSignature?: string) => {
  if (personalSignature) {
    sessionStorage.setItem("personal_signature", personalSignature);
  } else {
    sessionStorage.removeItem("personal_signature");
  }
};

export default setPersonalSignature;
