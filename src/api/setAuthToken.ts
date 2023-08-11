import { Api } from "./api";

// store JWT or PASETO in LS and set axios headers if we do have a token

const setAuthToken = (token?: string) => {
  if (token) {
    Api.defaults.headers.common["authorization"] = "bearer " + token;
    localStorage.setItem("access_token", token);
    // localStorage.setItem("access_token", token);
  } else {
    delete Api.defaults.headers.common["authorization"];
    localStorage.removeItem("access_token");
    // localStorage.removeItem("access_token");
  }
};

export default setAuthToken;
