import { BACKEND_PORT } from "./config.js"

// Request URL
export const URL = "http://localhost:" + BACKEND_PORT

// Clear all the elements on current page and ready for render a new page
export function clearPage() {
    const container = document.getElementById("container")
    if (container != null) {
        container.remove()
    }
    const modals = document.getElementsByClassName("modal-backdrop")
    for (let item of modals) item.remove()
    const popovers = document.getElementsByClassName("popover")
    for (let item of popovers) item.remove()
}

// Parse a template to DOM
export function template(id) {
    const template = document.getElementById(id)
    return template.content.cloneNode(true)
}

// Make a input area invalid
export function invalid(input) {
    input.classList.remove("is-valid")
    input.classList.add("is-invalid")
}

// Make a input area valid
export function valid(input) {
    input.classList.remove("is-invalid")
    input.classList.add("is-valid")
}

// Check the validity of email address
export function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
export function newvalidEmail(email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))||email == ""
}

// Display an error popup on the screen
export function displayAlert(content) {
    if (document.getElementById("alert") != null) {
        document.getElementById("alert").remove()
    }
    document.getElementById("container").appendChild(template("alert-template"))
    document.getElementById("alert-body").textContent = content
    new bootstrap.Modal(document.getElementById("alert"), {}).show()
}

// Display an modal containing contents on the screen
export function displayModal(jobId, creatorId, like=true) {
    if (document.getElementById("modal") != null) {
        document.getElementById("modal").remove()
    }
    document.getElementById("container").appendChild(template("modal-template"))
    // document.getElementById("modal-body").textContent = content
    document.getElementById("modal-title").textContent = like ? "Likers" : "Comments"
    const modalBody = document.getElementById("modal-body")
    modalBody.name = `modal-${jobId}`
    fetch(`${URL}/user?userId=${creatorId}`, {
        method: "GET",
        headers: header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        for (let r of res.jobs) {
            if (r.id == jobId) {
                if (like) {
                    for (let user of r.likes) {
                        const liker = createALabel("text-decoration-none", `#profile=${user.userId}`, `@${user.userName} `, `modal-like-${user.userId}`)
                        modalBody.appendChild(liker)
                    }
                } else {
                    for (let comment of r.comments) {
                        const commenter = createALabel("text-decoration-none", `#profile=${comment.userId}`, `@${comment.userName}`, `modal-comment-${comment.userId}`)
                        modalBody.appendChild(commenter)
                        const content = createLabel("p", "small p-1 m-0 border-bottom", null, comment.comment)
                        modalBody.appendChild(content)
                    }
                }
                break
            }
        }
        new bootstrap.Modal(document.getElementById("modal"), {}).show()
    }).catch(error => {
        error.message == "Failed to fetch" ? displayAlert("You can't see details of posts now due to a network error") : displayAlert(error.message)
    })
}

// Save token and userId to local storage
export function saveToken(token, userId) {
    window.localStorage.setItem("token", token)
    window.localStorage.setItem("userId", userId)
}

export function getToken() {
    return window.localStorage.getItem("token")
}

export function getUserId() {
    return window.localStorage.getItem("userId")
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

export function inactive() {
    for (let element of document.getElementsByClassName("nav-link")) {
        element.classList.remove("active")
    }
}

// Create different labels
export function createALabel(className, href, textContent, id) {
    const label = document.createElement("a")
    if (className != null) label.className = className;
    if (href != null) label.href = href
    if (id != null) label.id = id
    if (textContent != null) label.textContent = textContent
    return label
}

export function createLabel(type, className, id, textContent) {
    const label = document.createElement(type)
    if (className != null) label.className = className;
    if (id != null) label.id = id
    if (textContent != null) label.textContent = textContent
    return label
}

export function createImage(src, width, height, id, className) {
    const label = document.createElement("img")
    label.src = src
    if (className != null) label.className = className;
    if (id != null) label.id = id
    if (width != null) label.width = width
    if (height != null) label.height = height
    return label
}

// Re-Format a given date string to a specific format
export function dateFormat(date, duration=false) {
    const dateObj = new Date(date)
    if (!duration) return `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1).toString().padStart(2, "0")}/${dateObj.getFullYear()}`

    const now = new Date()
    if (now - (24 * 60 * 60 * 1000) >= dateObj.getTime()) {
        return `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1).toString().padStart(2, "0")}/${dateObj.getFullYear()}`
    }
    else {
        let diff = (now - dateObj) / 1000
        let hour = parseInt(diff / 3600)
        diff -= hour * 3600
        let minutes = parseInt(diff / 60)
        return `${hour}h${minutes}m ago`
    }
}
