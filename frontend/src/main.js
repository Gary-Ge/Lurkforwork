import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import * as login from "./login.js";
import { render } from "./index.js";

window.addEventListener("hashchange", displayPage)
displayPage()

function displayPage() {
    switch(window.location.hash) {
        case "#login":
            login.renderLogin()
            break
        case "#register":
            login.renderRegister()
            break
        default:
            render()
            break
    }
}