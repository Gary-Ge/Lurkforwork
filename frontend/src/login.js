import * as common from "./common.js"
import { LoginDTO, RegisterDTO } from "./entity.js"
import { render } from "./index.js"

export function renderLogin() {
    common.clearPage()
    document.body.appendChild(common.template("login-template"))
    document.getElementById("sign-up").addEventListener("click", renderRegister)

    // Every time the login page is rendered, register all the listeners
    const email = document.getElementById("email")
    email.addEventListener("blur", () => { checkEmail(email, true) })
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { checkNotNull(password, true) })
    document.getElementById("form").addEventListener("submit", function(event) { 
        event.preventDefault()
        login(email, password)
    })
}

function renderRegister() {
    common.clearPage()
    document.body.appendChild(common.template("register-template"))
    document.getElementById("sign-in").addEventListener("click", renderLogin)

    // Every time the register page is rendered, register all the listeners
    const email = document.getElementById("email")
    email.addEventListener("blur", () => { checkEmail(email) })
    const name = document.getElementById("name")
    name.addEventListener("blur", () => { checkNotNull(name) })
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { checkNotNull(password) })
    const confirmPassword = document.getElementById("confirm-password")
    confirmPassword.addEventListener("blur", () => { checkConfirmPassword(password, confirmPassword) })
    document.getElementById("form").addEventListener("submit", function(event) { 
        event.preventDefault()
        register(email, name, password, confirmPassword)
    })
}

function checkEmail(input, mode=false) {
    if (input.value === "" || !common.validEmail(input.value)) {
        common.invalid(input)
        return false
    } else {
        mode ? input.classList.remove("is-invalid") : common.valid(input)
        return true
    }
}

function checkNotNull(input, mode=false) {
    if (input.value === "") {
        common.invalid(input)
        return false
    } else {
        mode ? input.classList.remove("is-invalid") : common.valid(input)
        return true
    }
}

function checkConfirmPassword(password, confirmPassword) {
    if (password.value != confirmPassword.value) {
        common.invalid(confirmPassword)
        return false
    } else {
        common.valid(confirmPassword)
        return true
    }
}

function login(email, password) {
    if (!checkEmail(email, true)) {
        common.displayAlert("Please input a valid email address")
        return
    }
    if (!checkNotNull(password, true)) {
        common.displayAlert("Please input your password")
        return
    }

    // Request the Login API
    fetch(common.URL + "/auth/login", {
        method: "POST",
        body: JSON.stringify(new LoginDTO(email.value, password.value)),
        headers: common.header(false)
    }).then(res => res.json()).then(res => {
        if (res.token == null) {
            throw new Error(res.error)
        }
        common.saveToken(res.token, res.userId)
        render()
    }).catch(error => {
        common.displayAlert(error.message)
    })
}

function register(email, name, password, confirmPassword) {
    if (!checkEmail(email)) {
        common.displayAlert("Please input a valid email address")
        return
    }
    if (!checkNotNull(name)) {
        common.displayAlert("Please input a name")
        return
    }
    if (!checkNotNull(password)) {
        common.displayAlert("Please input a password")
        return
    }
    if (!checkConfirmPassword(password, confirmPassword)) {
        common.displayAlert("Two passwords are not match")
        return
    }

    // Request the Register API
    fetch(common.URL + "/auth/register", {
        method: "POST",
        body: JSON.stringify(new RegisterDTO(email.value, name.value, password.value)),
        headers: common.header(false)
    }).then(res => res.json()).then(res => {
        if (res.token == null) {
            throw new Error(res.error)
        }
        common.saveToken(res.token, res.userId)
        render()
    }).catch(error => {
        common.displayAlert(error.message)
    })
}