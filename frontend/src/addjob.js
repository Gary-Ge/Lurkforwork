import * as common from "./common.js"
import { checkNotNull } from "./login.js"
import { fileToDataUrl } from "./helpers.js"
import { PostJobDTO, UpdateJobDTO } from "./entity.js"
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
        postJob(title, description, start, image)
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
                renderInfo(job, id)
            }
        }
        if (!found) throw new Error("Job not found or the job is not posted by yourself.")
    }).catch(error => { renderNotFound(error.message) })
}

function renderInfo(res, id) {
    const title = document.getElementById("title")
    title.value = res.title
    title.addEventListener("blur", () => { 
        if (title.value == res.title) {
            common.valid(title)
            document.getElementById("valid-title").textContent = "The job title will not change"
        } else {
            document.getElementById("valid-title").textContent = ""
            checkNotNull(title)
        }
    })

    const description = document.getElementById("description")
    description.value = res.description
    description.addEventListener("blur", () => { 
        if (description.value == res.description) {
            common.valid(description)
            document.getElementById("valid-description").textContent = "The job description will not change"
        } else {
            document.getElementById("valid-description").textContent = ""
            checkNotNull(description)
        }
     })

    const start = document.getElementById("start")
    let dateStart = new Date(res.start)
    let dateString = `${dateStart.getFullYear().toString().padStart(4, "0")}-${(dateStart.getMonth() + 1).toString().padStart(2, "0")}-${dateStart.getDate().toString().padStart(2, "0")}`
    start.value = dateString;
    start.addEventListener("blur", () => { 
        if (start.value == dateString) {
            common.valid(start)
            document.getElementById("valid-start").textContent = "The start date will not change"
        } else {
            document.getElementById("valid-start").textContent = ""
            checkDate(start)
        }
    })

    document.getElementById("img-display").src = res.image
    const image = document.getElementById("image")
    image.name = res.image
    image.addEventListener("change", () => { parseFile(image, res.image) })

    const submit = document.getElementById("post")
    submit.addEventListener("click", function(event) {
        event.preventDefault()
        updateJob(id, title, description, start, image)
    })
}

function parseFile(image, origin=null) {
    const file = image.files[0]

    if (file == null) {
        image.name = origin ? origin : "assets/default-job-icon.svg"
        document.getElementById("img-display").src = origin ? origin : "assets/default-job-icon.svg"
        document.getElementById("valid-image").textContent = origin ? "Your job icon will not change" : "A default icon will be used"
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

function updateJob(id, title, description, start, image) {
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
        method: "PUT",
        headers: common.header(),
        body: JSON.stringify(new UpdateJobDTO(id, title.value, description.value, convertDateToUTC(dateStart), image.name))
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        window.location.hash = "#profile"
    }).catch(error => { common.displayAlert(error.message) })
}

function convertDateToUTC(date) { 
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}