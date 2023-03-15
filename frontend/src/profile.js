import * as common from "./common.js"
import { WatchDTO } from "./entity.js"
import { renderUpdate } from "./update.js"

export function renderProfile(id) {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    let mine = id == common.getUserId() ? true : false

    common.clearPage()
    document.body.appendChild(common.template("profile-template"))
    if (mine) document.getElementById("title").textContent = "My Posted Jobs"

    fetch(`${common.URL}/user?userId=${id}`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        renderHeader(res, mine)
    }).catch(error => renderNotFound(error.message))

    fetch(`${common.URL}/job/feed?start=0`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        renderJobs(res, id)
    }).catch(error => renderNotFound(error.message))
}

function renderHeader(res, mine) {
    document.getElementById("user-img").src = res.image == null ? "assets/default-icon.svg" : res.image

    const p = document.getElementById("info")
    const strong = common.createLabel("strong", null, null, res.name)
    p.appendChild(strong)
    p.appendChild(document.createElement("br"))

    p.appendChild(document.createTextNode(res.email))
    p.appendChild(document.createElement("br"))

    const a = common.createALabel("text-decoration-none", "#", `Watchees: ${res.watcheeUserIds.length}`)
    p.appendChild(a)
    p.appendChild(document.createElement("br"))

    const small = common.createLabel("small", null, null, `UID: ${res.id}`)
    p.appendChild(small)

    const button = document.getElementById("watch")
    const button_add = document.getElementById("addjob")
    if (mine) {
        button.textContent = "Update"
        button.addEventListener("click", () => { window.location.hash = "#update" })
        button_add.addEventListener("click", () => { window.location.hash = "#addjob" })
    } else {
        button_add.parentNode.removeChild(button_add);
        let watched = false;
        for (let i of res.watcheeUserIds) {
            if (i == common.getUserId()) {
                button.textContent = "Watched"
                button.className = "btn btn-primary p-1 rounded-4 border-2"
                watched = true
                break
            }
        }
        button.name = watched ? "watched" : "watch"
        button.addEventListener("click", () => { watch(res.id, res.email, button, a) })
    }
}

function renderJobs(res, id) {
    const listContainer = document.getElementById("jobs")
    for (let r of res) {
        if (r.creatorId == id) {
            listContainer.appendChild(renderItem(r))
        }
    }
}

function renderItem(r) {
    // Create the p label containing all the contents (except the image) of a job
    const p = common.createLabel("p", "small p-3 m-0")

    // Create the text node containing the post time
    p.appendChild(document.createTextNode(`${common.dateFormat(r.createdAt, true)}`))
    p.appendChild(document.createElement("br"))

    // Create title of job
    const title = common.createLabel("strong", null, null, r.title)
    p.appendChild(title)
    p.appendChild(document.createElement("br"))
    // Create the text node containing the description of job
    p.appendChild(document.createTextNode(r.description))
    p.appendChild(document.createElement("br"))

    // Create the start time of job
    const start = common.createLabel("small", null, null, `Start on ${common.dateFormat(r.start)}`)
    p.appendChild(start)
    p.appendChild(document.createElement("br"))

    // Create the image of job
    const image = common.createImage(r.image, 48, 48, null, "rounded mt-4")

    // Create the container containing the information of job
    const infoContainer = common.createLabel("div", "d-flex text-muted border-bottom text-break")
    infoContainer.appendChild(image)
    infoContainer.appendChild(p)

    return infoContainer
}

export function renderNotFound(message) {
    common.clearPage()
    document.body.appendChild(common.template("not-found-template"))
    document.getElementById("message").textContent = message
    document.getElementById("home").addEventListener("click", () => { window.location.hash = "" })
}

function watch(id, email, button, watchees) {
    let watch = button.name == "watched" ? false : true
    fetch(`${common.URL}/user/watch`, {
        method: "PUT",
        headers: common.header(),
        body: JSON.stringify(new WatchDTO(email, watch))
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        button.name = watch ? "watched" : "watch"
        button.textContent = watch ? "Watched" : "Watch"
        button.className = watch ? "btn btn-primary p-1 rounded-4 border-2" : "btn btn-outline-primary p-1 rounded-4 border-2"
        updateWachees(id, watchees)
    }).catch(error => common.displayAlert(error.message))
}

function updateWachees(id, watchees) {
    fetch(`${common.URL}/user?userId=${id}`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        watchees.textContent = `Watchees: ${res.watcheeUserIds.length}`
    }).catch(error => common.displayAlert(error.message))
}