import { renderLogin } from "./login.js"
import * as common from "./common.js";

export function render() {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("index-template"))
    common.active("nav-home")
    document.getElementById("like").addEventListener("click", changeImage)
}

function changeImage() {
    document.getElementById("like-image").src = "assets/liked.svg"
}