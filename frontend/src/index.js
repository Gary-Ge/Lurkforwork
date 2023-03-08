import { renderLogin } from "./login.js"
import * as common from "./common.js";

export function render() {
    if (window.localStorage.getItem("token") == null) {
        console.log("No token")
        renderLogin()
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("index-template"))
}