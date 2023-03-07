import * as common from "./common.js"

export function renderLogin() {
    common.clearPage()
    document.body.appendChild(common.template("login-template"))
    document.getElementById("sign-up").addEventListener("click", renderRegister)
    const email = document.getElementById("email")
    email.addEventListener("blur", () => { checkEmail(email) })
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { checkPassword(password) })
}

function renderRegister() {
    console.log(document.getElementById("login-template").content)
    common.clearPage()
    document.body.appendChild(common.template("register-template"))
    document.getElementById("sign-in").addEventListener("click", renderLogin)
}

function checkEmail(input) {
    if (input.value == "") common.invalid(input)
    else common.valid(input)
}

function checkPassword(input) {
    if (input.value == "") common.invalid(input)
    else common.valid(input)
}