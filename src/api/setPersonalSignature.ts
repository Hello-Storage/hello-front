// store personalSignature in SS and set axios headers if we do have a token

const setPersonalSignature = (personalSignature?: string) => {
  if (personalSignature) {
    console.log("Setting personal_signature");  // Logging for debugging
    sessionStorage.setItem("personal_signature", personalSignature);
  } else {
    console.log("Removing personal_signature");  // Logging for debugging
    sessionStorage.removeItem("personal_signature");
  }
};

export default setPersonalSignature;
