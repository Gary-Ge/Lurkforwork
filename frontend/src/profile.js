import * as common from "./common.js"
import { WatchDTO } from "./entity.js"

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

        let sortedJobs = res.jobs.sort(function(a, b) {
            let t1 = a.createdAt
            let t2 = b.createdAt
            if (t1 < t2) return 1
            else if (t1 == t2) return 0
            else return -1
        })
        renderJobs(sortedJobs, mine)
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
    a.addEventListener("click", function(event) {
        event.preventDefault()
        displayWatchees(res.watcheeUserIds)
    })
    p.appendChild(a)
    p.appendChild(document.createElement("br"))

    const small = common.createLabel("small", null, null, `UID: ${res.id}`)
    p.appendChild(small)

    const button = document.getElementById("watch")
    if (mine) {
        button.textContent = "Update"
        button.className = "btn btn-primary p-1 border-2"
        button.addEventListener("click", () => { window.location.hash = "#update" })
        const buttonAdd = common.createLabel("button", "btn btn-primary p-1 border-2 mt-2 profile-button", null, "Add Job")
        document.getElementById("buttons").appendChild(buttonAdd)
        buttonAdd.addEventListener("click", () => { window.location.hash = "#addjob" })
    } else {
        let watched = false;
        for (let i of res.watcheeUserIds) {
            if (i == common.getUserId()) {
                button.textContent = "Watched"
                button.className = "btn btn-primary p-1 border-2"
                watched = true
                break
            }
        }
        button.name = watched ? "watched" : "watch"
        button.addEventListener("click", () => { watch(res.id, res.email, button, a) })
    }
}

function renderJobs(res, mine) {
    const listContainer = document.getElementById("jobs")
    for (let r of res) {
        listContainer.appendChild(renderItem(r, mine))
    }
}

function renderItem(r, mine) {
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

    if (mine) {
        const buttonEdit = common.createLabel("button", "btn btn-sm p-0")
        const editImage = common.createImage("assets/edit-job.svg", 20, 20)
        buttonEdit.addEventListener("click", () => { window.location.hash = `#update_job=${r.id}` })
        buttonEdit.appendChild(editImage)
        p.appendChild(buttonEdit)

        const buttonDelete = common.createLabel("button", "btn btn-sm p-0")
        const deleteImage = common.createImage("assets/delete-job.svg", 20, 20)
        buttonDelete.addEventListener("click", () => { deleteJob(r.title, r.id) })
        buttonDelete.appendChild(deleteImage)
        p.appendChild(buttonDelete)
    }

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
        button.className = watch ? "btn btn-primary p-1 border-2" : "btn btn-outline-primary p-1 border-2"
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

function displayWatchees(watcheeUserIds) {
    if (document.getElementById("modal") != null) {
        document.getElementById("modal").remove()
    }
    document.getElementById("container").appendChild(common.template("modal-template"))
    document.getElementById("modal-title").textContent = "Watchees"
    const modalBody = document.getElementById("modal-body")
    const fetches = []
    for (let id of watcheeUserIds) {
        fetches.push(new Promise(function (resolve, reject) {
            fetch(`${common.URL}/user?userId=${id}`, {
                method: "GET",
                headers: common.header()
            }).then(res => res.json()).then(res => {
                if (res.error != null) {
                    throw new Error(res.error)
                }
                resolve(res)
            }).catch(error => reject(error))
        }))
    }
    Promise.all(fetches).then(userRes => { 
        if (userRes.length != watcheeUserIds.length) throw new Error("Bad Result")
        for (let i in userRes) {
            const watchee = common.createALabel("text-decoration-none", `#profile=${userRes[i].id}`, `@${userRes[i].name}`)
            modalBody.appendChild(watchee)
            modalBody.appendChild(document.createElement("br"))
        }
    }).catch((error) => common.displayAlert(error.message))

    new bootstrap.Modal(document.getElementById("modal"), {}).show()

}

function deleteJob(title, jobId) {
    if (document.getElementById("alert") != null) {
        document.getElementById("alert").remove()
    }
    document.getElementById("container").appendChild(common.template("alert-template"))
    document.getElementById("alert-body").textContent = `Are you sure you want to delete job "${title}"?`

    let modal = new bootstrap.Modal(document.getElementById("alert"), {})

    const confirm = common.createLabel("button", "btn btn-danger", null, "Confirm")
    confirm.addEventListener("click", () => { 
        modal.hide()
        fetch(`${common.URL}/job`, {
            method: "DELETE",
            headers: common.header(),
            body: JSON.stringify({ id: jobId })
        }).then(res => res.json()).then(res => {
            if (res.error != null) {
                throw new Error(res.error)
            }
            location.reload()
        }).catch(error => { common.displayAlert(error.message) })
    })
    document.getElementById("alert-footer").appendChild(confirm)

    modal.show()
}

function updateJob(jobId) {

}