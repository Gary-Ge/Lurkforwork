// A helper you may want to use when uploading new images to the server.
import { renderLogin, renderRegister } from "./login.js";
import { renderProfile } from "./profile.js";
import { render, stopPolling } from "./index.js";
import * as common from "./common.js"
import { renderUpdate } from './update.js';
import { renderAdd, renderUpdateJob } from './addjob.js';

window.addEventListener("hashchange", displayPage)
displayPage()

function displayPage() {
    stopPolling()
    const hash = window.location.hash
    switch(true) {
        case hash == "#login":
            renderLogin()
            break
        case hash == "#register":
            renderRegister()
            break
        case hash.startsWith("#profile"):
            if (hash == "#profile") renderProfile(common.getUserId())
            else renderProfile(hash.split("=")[1])
            break
        case hash.startsWith("#update_job="):
            renderUpdateJob(hash.split("=")[1])
            break
        case hash == "#update":
            renderUpdate()
            break
        case hash == "#addjob":
            renderAdd()
            break
        default:
            render()
            break
    }
}