import * as common from "./common.js";
import { LikeDTO, CommentDTO } from "./entity.js";

export function render() {
    if (window.localStorage.getItem("token") == null) {
        window.location.hash = "#login"
        return
    }
    common.clearPage()
    document.body.appendChild(common.template("index-template"))


    fetch(common.URL + "/job/feed?start=0", {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        renderList(res)
    }).catch(error => common.displayAlert(error.message))

    common.active("nav-home")
}

function liking(id, image, button, likeCount) {
    let like = button.name == "liked" ? false : true
    fetch(`${common.URL}/job/like`, {
        method: "PUT",
        headers: common.header(),
        body: JSON.stringify(new LikeDTO(id, like))
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        image.src = like ? "assets/liked.svg" : "assets/like.svg"
        button.name = like ? "liked" : "like"
        updateLike(id, likeCount)
    }).catch(error => common.displayAlert(error.message))
}

function updateLike(id, likeCount) {
    fetch(`${common.URL}/job/feed?start=0`, {
        method: "GET",
        headers: common.header(),
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        for (let r of res) {
            if (r.id == id) likeCount.textContent = r.likes.length
        }
    }).catch(error => common.displayAlert(error.message))
}

function updateComment(jobid, creatorId, commentCount) {
    fetch(`${common.URL}/user?userId=${creatorId}`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        for (let r of res.jobs) {
            if (r.id == jobid) {
                commentCount.textContent = r.comments.length
            }
        }
    }).catch(error => common.displayAlert(error.message))
}

function renderList(res) {
    const listContainer = common.createLabel("div", "container h-75 rounded-4 shadow-sm feed-container overflow-y-auto")

    const fetches = []
    for (let r of res) {
        fetches.push(new Promise(function (resolve, reject) {
            fetch(`${common.URL}/user?userId=${r.creatorId}`, {
                method: "GET",
                headers: common.header()
            }).then(res => res.json()).then(res => {
                if (res.error != null) {
                    throw new Error(res.error)
                }
                resolve(res)
            }).catch (error => reject(error))
        }))
    }
    Promise.all(fetches).then(userRes => { 
        if (userRes.length != res.length) throw new Error("Bad Result")
        for (let i in userRes) {
            listContainer.appendChild(renderItem(res[i], userRes[i].name))
        }
    }).catch((error) => common.displayAlert(error.message))
    const titleContainer = common.createLabel("div", "container rounded-4 shadow-sm mb-2 feed-container d-flex align-items-center justify-content-center")
    const title = common.createLabel("h5", "p-2 m-0", null, "Recently Updated Jobs")
    titleContainer.appendChild(title)
    document.getElementById("container").appendChild(titleContainer)
    document.getElementById("container").appendChild(listContainer)
}

function renderItem(r, name) {
    // Create the p label containing all the contents (except the image) of a job
    const p = common.createLabel("p", "small p-3 m-0")

    // Create the a label containing the name of the poster
    const poster = common.createALabel("text-decoration-none", `#profile=${r.creatorId}`, `@${name}`)
    p.appendChild(poster)
    // Create the text node containing the post time
    p.appendChild(document.createTextNode(` - ${common.dateFormat(r.createdAt, true)}`))
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

    // Create the like image
    let liked = false;
    for (let liker of r.likes) {
        if (liker.userId == common.getUserId()) {
            liked = true
            break
        }
    }
    const likeImage = common.createImage(liked ? "assets/liked.svg" : "assets/like.svg", 24, 24, null)

    // Create the like button
    const like = common.createLabel("button", "btn btn-sm p-0")
    like.name = liked ? "liked" : "like"
    
    like.appendChild(likeImage)
    // Create the like count holder
    const likeCountHolder = common.createLabel("small")
    const likeCount = common.createALabel("text-decoration-none", "#", r.likes.length)
    like.addEventListener("click", () => { liking(r.id, likeImage, like, likeCount) })
    likeCount.addEventListener("click", function(event) {
        event.preventDefault()
        common.displayModal(r.id) 
        return false
    })
    likeCountHolder.appendChild(likeCount)
    p.appendChild(like)
    p.appendChild(likeCountHolder)

    // Create the comment button
    const comment = common.createLabel("button", "btn btn-sm p-0 m-1", "comment")
    // Create the comment image
    const commentImage = common.createImage("assets/comment.svg", 24, 24)
    comment.appendChild(commentImage)
    // Create the comment count holder
    const commentCountHolder = common.createLabel("small")
    const commentCount = common.createALabel("text-decoration-none", "#", r.comments.length)
    commentCount.addEventListener("click", function(event) {
        event.preventDefault()
        common.displayModal(r.id, false) 
        return false
    })
    commentCountHolder.appendChild(commentCount)
    p.appendChild(comment)
    p.appendChild(commentCountHolder)

    comment.addEventListener("click", () => {
        comment.disabled = "disabled"
        const commentArea = common.createLabel("textarea", "form-control")
        commentArea.rows = "3"
        commentArea.placeholder = "Comment"
        p.appendChild(commentArea)

        const send = common.createLabel("button", "btn btn-primary p-1 border-2 float-end mt-2", null, "Send")
        const close = common.createLabel("button", "btn btn-danger p-1 border-2 float-end m-2", null, "Close")
        p.appendChild(send)
        p.appendChild(close)

        close.addEventListener("click", () => {
            commentArea.remove()
            send.remove()
            close.remove()
            comment.disabled = ""
        })
        
        send.addEventListener("click", () => {
            if (commentArea.value == "") {
                common.displayAlert("Cannot send an empty comment")
                return
            }
            fetch(`${common.URL}/job/comment`, {
                method: "POST",
                headers: common.header(),
                body: JSON.stringify(new CommentDTO(r.id, commentArea.value))
            }).then(res => res.json()).then(res => {
                if (res.error != null) {
                    throw new Error(res.error)
                }
                updateComment(r.id, r.creatorId, commentCount)
                commentArea.remove()
                send.remove()
                close.remove()
                comment.disabled = ""
            }).catch(error => common.displayAlert(error.message))
        })
    })

    // Create the image of job
    const image = common.createImage(r.image, 48, 48, null, "rounded mt-4")

    // Create the container containing the information of job
    const infoContainer = common.createLabel("div", "d-flex text-muted border-bottom text-break")
    infoContainer.appendChild(image)
    infoContainer.appendChild(p)

    return infoContainer
}