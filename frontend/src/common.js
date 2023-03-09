import { BACKEND_PORT } from "./config.js"

// Request URL
export const URL = "http://localhost:" + BACKEND_PORT

// Clear all the elements on current page and ready for render a new page
export function clearPage() {
    const container = document.getElementById("container")
    if (container != null) {
        container.remove()
    }
}

export function template(id) {
    const template = document.getElementById(id)
    return template.content.cloneNode(true)
}

export function invalid(input) {
    input.classList.remove("is-valid")
    input.classList.add("is-invalid")
}

export function valid(input) {
    input.classList.remove("is-invalid")
    input.classList.add("is-valid")
}

export function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function displayAlert(content) {
    if (document.getElementById("alert") == null) {
        document.getElementById("container").appendChild(template("alert-template"))
    }
    document.getElementById("alert-body").textContent = content
    new bootstrap.Modal(document.getElementById("alert"), {}).show()
}

export function saveToken(token, userId) {
    window.localStorage.setItem("token", token)
    window.localStorage.setItem("userId", userId)
}

function getToken() {
    return window.localStorage.getItem("token")
}

export function removeToken() {
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("userId")
}

export function header(auth=true) {
    return auth ? { "Content-Type": "application/json", "Authorization": getToken() } : { "Content-Type": "application/json" }
}

export function active(id) {
    for (let element of document.getElementsByClassName("nav-link")) {
        element.id === id ? element.classList.add("active") : element.classList.remove("active")
    }
    const login = document.getElementById("nav-login")
    login.textContent = getToken() == null ? "Login" : "Logout"
}
