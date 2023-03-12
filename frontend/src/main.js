import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import * as login from "./login.js";
import { renderProfile } from "./profile.js";
import { render } from "./index.js";
import * as common from "./common.js"
import { renderUpdate } from './update.js';

window.addEventListener("hashchange", displayPage)
displayPage()

function displayPage() {
    const hash = window.location.hash
    switch(true) {
        case hash == "#login":
            login.renderLogin()
            break
        case hash == "#register":
            login.renderRegister()
            break
        case hash == "#":
            break
        case hash.startsWith("#profile"):
            if (hash == "#profile") renderProfile(common.getUserId())
            else renderProfile(hash.split("=")[1])
            break
        case hash == "#update":
            renderUpdate()
            break
        default:
            render()
            break
    }
}