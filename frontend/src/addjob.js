import * as common from "./common.js"
import { checkNotNull } from "./login.js"
export function renderAdd() {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("add-job-template"))

    const title = document.getElementById("title")
    title.addEventListener("blur", () => { checkNotNull(title) })
    const description = document.getElementById("description")
    description.addEventListener("blur", () => { checkNotNull(description) })
}