/// <reference types="vite/client" />
declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// define env types
interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GITHUB_CLIENT_ID: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
