import { Api } from "./api";

// store personalSignature in SS and set axios headers if we do have a token

const setPersonalSignature = (personalSignature?: string) => {
  if (personalSignature) {
    console.log("Setting personal_signature");  // Logging for debugging
    Api.defaults.headers.common["personal_signature"] = personalSignature;
    sessionStorage.setItem("personal_signature", personalSignature);
  } else {
    console.log("Removing personal_signature");  // Logging for debugging
    delete Api.defaults.headers.common["personal_signature"];
    sessionStorage.removeItem("personal_signature");
  }
};

export default setPersonalSignature;
