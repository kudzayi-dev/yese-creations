/// <reference types="vite/client" />

// Ambient module declarations for Vite asset imports not covered by
// @types/node or @types/react. CSS Modules need this so
// `import styles from "./X.module.css"` typechecks.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
