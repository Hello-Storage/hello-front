export const APP_MODE = import.meta.env.MODE;
export const API_ENDPOINT =
  APP_MODE === "development"
    ? "http://localhost:8080/api"
    : "https://api.joinhello.app/api";

console.log(APP_MODE);
