import * as common from "./common.js"
import { checkNotNull } from "./login.js"
import { fileToDataUrl } from "./helpers.js"
import { PostJobDTO } from "./entity.js"
import { renderNotFound } from "./profile.js"

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
    const start = document.getElementById("start")
    start.addEventListener("blur", () => { checkDate(start) })
    const image = document.getElementById("image")
    image.name = "assets/default-job-icon.svg"
    image.addEventListener("change", () => { parseFile(image) })

    const submit = document.getElementById("post")
    submit.addEventListener("click", function(event) {
        event.preventDefault()
        updateJob(title, description, start, image)
    })
}

export function renderUpdateJob(id) {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("add-job-template"))

    document.getElementById("form-title").textContent = "Update Job"

    fetch(`${common.URL}/user?userId=${common.getUserId()}`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        let found = false
        for (let job of res.jobs) {
            if (job.id == id) {
                found = true
                renderInfo(job)
            }
        }
        if (!found) throw new Error("Job not found or the job is not posted by yourself.")
    }).catch(error => { renderNotFound(error.message) })
}

function renderInfo(res) {
    const title = document.getElementById("title")
    title.value = res.title
    title.addEventListener("blur", () => { checkNotNull(title) })

    const description = document.getElementById("description")
    description.value = res.description
    description.addEventListener("blur", () => { checkNotNull(description) })

    const start = document.getElementById("start")
    start.addEventListener("blur", () => { checkDate(start) })

    document.getElementById("img-display").src = res.image
    const image = document.getElementById("image")
    image.name = "assets/default-job-icon.svg"
    image.addEventListener("change", () => { parseFile(image) })

    const submit = document.getElementById("post")
    submit.addEventListener("click", function(event) {
        event.preventDefault()
        postJob(title, description, start, image)
    })
}

function parseFile(image) {
    const file = image.files[0]

    if (file == null) {
        image.name = "assets/default-job-icon.svg"
        document.getElementById("img-display").src = "assets/default-job-icon.svg"
        document.getElementById("valid-image").textContent = "A default icon will be used"
        common.valid(image)
        return
    }

    fileToDataUrl(file).then(res => {
        image.name = res
        document.getElementById("img-display").src = image.name
        document.getElementById("valid-image").textContent = `Your job icon will be ${file.name}`
        common.valid(image)
    }).catch(error => {
        document.getElementById("invalid-image").textContent = error.message
        common.invalid(image)
    })
}

function checkDate(start) {
    if (start.value === "") {
        document.getElementById("invalid-start").textContent = "Please choose a valid start date"
        common.invalid(start)
        return false
    }
    let minDate = new Date("2000-01-01")
    let startDate = new Date(start.value)
    if (startDate < minDate) {
        document.getElementById("invalid-start").textContent = "The start date cannot earlier than 01-01-2000"
        common.invalid(start)
        return false
    }
    common.valid(start)
    return true
}

function postJob(title, description, start, image) {
    if (!checkNotNull(title)) {
        common.displayAlert("Please input a title")
        return
    }
    if (!checkNotNull(description)) {
        common.displayAlert("Please input a description")
        return
    }
    if (!checkDate(start)) {
        common.displayAlert(document.getElementById("invalid-start").textContent)
        return
    }
    let dateStart = new Date(start.value)
    fetch(`${common.URL}/job`, {
        method: "POST",
        headers: common.header(),
        body: JSON.stringify(new PostJobDTO(title.value, description.value, convertDateToUTC(dateStart), image.name))
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        window.location.hash = "#profile"
    }).catch(error => { common.displayAlert(error.message) })
}

function updateJob(title, description, start, image) {
    if (!checkNotNull(title)) {
        common.displayAlert("Please input a title")
        return
    }
    if (!checkNotNull(description)) {
        common.displayAlert("Please input a description")
        return
    }
    if (!checkDate(start)) {
        common.displayAlert(document.getElementById("invalid-start").textContent)
        return
    }
    let dateStart = new Date(start.value)
}

function convertDateToUTC(date) { 
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}