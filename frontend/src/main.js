import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import * as login from "./login.js";

document.getElementById("test").addEventListener("click", login.renderLogin)