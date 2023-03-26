import * as common from "./common.js"
import { renderNotFound } from "./profile.js"
import { checkEmail, checkNotNull } from "./login.js"
import { fileToDataUrl } from "./helpers.js"
import { UpdateDTO } from "./entity.js"

export function renderUpdate() {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("update-profile-template"))
    fetch(`${common.URL}/user?userId=${common.getUserId()}`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        renderInfo(res)
    }).catch(error => {
        error.message == "Failed to fetch" ? renderNotFound("Cannot update user profile now due to a network error") : renderNotFound(error.message)
    })
}

function renderInfo(res) {
    const email = document.getElementById("email")
    email.value = res.email
    email.addEventListener("blur", () => { 
        if (email.value == res.email) {
            document.getElementById("valid-email").textContent = "Your email address will not change"
            common.valid(email)
        } else {
            document.getElementById("valid-email").textContent = ""
            checkEmail(email) 
        }
    })
    
    const name = document.getElementById("name")
    name.value = res.name
    name.addEventListener("blur", () => { 
        if (name.value == res.name) {
            document.getElementById("valid-name").textContent = "Your name will not change"
            common.valid(name)
        } else {
            document.getElementById("valid-name").textContent = ""
            checkNotNull(name)
        }
    })
    
    const password = document.getElementById("password")
    password.addEventListener("blur", () => { 
        checkNotNull(password)
    })

    const image = document.getElementById("image")
    image.addEventListener("change", () => { parseFile(image) })
    if (res.image != null) document.getElementById("img-display").src = res.image

    document.getElementById("update").addEventListener("click", function(event) { 
        event.preventDefault()
        update(res, email, name, password, image)
    })
}

function parseFile(image) {
    const file = image.files[0]

    if (file == null) {
        image.name = ""
        document.getElementById("img-display").src = "assets/default-icon.svg"
        document.getElementById("valid-image").textContent = "Your image will not change"
        common.valid(image)
        return
    }

    fileToDataUrl(file).then(res => {
        image.name = res
        document.getElementById("img-display").src = image.name
        document.getElementById("valid-image").textContent = `Your new image would be ${file.name}`
        common.valid(image)
    }).catch(error => {
        document.getElementById("invalid-image").textContent = error.message
        common.invalid(image)
    })
}

function update(res, email, name, password, image) {
    if (!(checkEmail(email))) {
        common.displayAlert("Please input a valid email address")
        return
    }
    if (!(checkNotNull(name))) {
        common.displayAlert("Please input a valid name")
        return
    }
    if (!(checkNotNull(password))) {
        common.displayAlert("Please input a password")
        return
    }
    if (image.classList.contains("is-invalid")) {
        common.displayAlert(document.getElementById("invalid-image").textContent)
        return
    }
    fetch(`${common.URL}/user`, {
        method: "PUT",
        headers: common.header(),
        body: JSON.stringify(new UpdateDTO(email.value == res.email ? "" : email.value, password.value, name.value, image.name))
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        window.location.hash = "#profile"
    }).catch(error => error.message == "Failed to fetch" ? common.displayAlert("You can't update user profile now due to a network error") : common.displayAlert(error.message))
}