/// <reference types="vite/client" />
declare module '*?code' {
  const code: import('./types').CodeBundle;
  export default code;
}
