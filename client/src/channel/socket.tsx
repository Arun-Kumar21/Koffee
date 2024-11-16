import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.VITE_SERVER_URL? import.meta.env.VITE_SERVER_URL : "localhost:5500";
console.log(import.meta.env.VITE_SERVER_URL, URL,"dfg");

export const socket = io(URL);