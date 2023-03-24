// A helper you may want to use when uploading new images to the server.
import { renderLogin, renderRegister } from "./login.js";
import { renderProfile } from "./profile.js";
import { render, stopPolling } from "./index.js";
import * as common from "./common.js"
import { renderUpdate } from './update.js';
import { renderAdd, renderUpdateJob } from './addjob.js';

let mostRecentDate = null
let pollingRecent

export function sendNotification(title, content) {
    let notification 
    if (Notification.permission === 'default' || Notification.permission === 'undefined') {
        Notification.requestPermission(function(result) {
            if (result === 'granted') {
                notification = new Notification(title, {
                    body: content,
                    icon: "assets/4.svg"
                })
            }
        })
    } else {
        notification = new Notification(title, {
            body: content,
            icon: "assets/4.svg"
        })
    }
}

function requestNotificationPermission() {
    Notification.requestPermission(function(result) {
        return result
    })
}

window.addEventListener("hashchange", displayPage)
requestNotificationPermission()
displayPage()

function displayPage() {
    stopPolling()
    const hash = window.location.hash
    switch(true) {
        case hash == "#login":
            clearInterval(pollingRecent)
            renderLogin()
            break
        case hash == "#register":
            renderRegister()
            break
        case hash.startsWith("#profile"):
            if (hash == "#profile") renderProfile(common.getUserId())
            else renderProfile(hash.split("=")[1])
            break
        case hash.startsWith("#update_job="):
            renderUpdateJob(hash.split("=")[1])
            break
        case hash == "#update":
            renderUpdate()
            break
        case hash == "#addjob":
            renderAdd()
            break
        default:
            render()
            break
    }
    if (common.getToken() != null) {
        if (mostRecentDate == null) {
            fetchMostRecentJob(setMostRecentJob)
        }
        clearInterval(pollingRecent)
        pollingRecent = setInterval(pollingRecentJobs, 3000)
    }
}

function pollingRecentJobs() {
    fetchMostRecentJob(compareMostRecentJob)
}

function fetchMostRecentJob(action) {
    fetch(`${common.URL}/job/feed?start=0`, {
        method: "GET",
        headers: common.header()
    }).then(res => res.json()).then(res => {
        if (res.error != null) {
            throw new Error(res.error)
        }
        action(res)
    }).catch(error => { 
        if (error.message == "Failed to fetch") {
            if (window.localStorage.getItem("jobs_cache") != null) {
                action(JSON.parse(window.localStorage.getItem("jobs_cache")), false)
            }
        } else common.displayAlert(error.message) 
    })
}

function cacheRecentJobs(res) {
    window.localStorage.setItem("jobs_cache", JSON.stringify(res))
}

function cacheRecentJobPoster(res) {
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
        let userNames = []
        for (let i in userRes) {
            userNames.push(userRes[i].name) 
        }
        window.localStorage.setItem("posters_cache", JSON.stringify(userNames))
    }).catch((error) => common.displayAlert(error.message))
}

function setMostRecentJob(res, cache=true) {
    mostRecentDate = res.length > 0 ? new Date(res[0].createdAt) : new Date("1970-01-01")
    if (cache) {
        cacheRecentJobs(res)
        cacheRecentJobPoster(res)
    }
}

function compareMostRecentJob(res, cache=true) {
    let recentDate = res.length > 0 ? new Date(res[0].createdAt) : new Date("1970-01-01")
    if (recentDate.getTime() == mostRecentDate.getTime()) return
    if (recentDate.getTime() > mostRecentDate.getTime()) sendNotification("A New Job", "A user you are watching has posted a new job, goto or refresh the main page to check it!")
    mostRecentDate = recentDate
    if (cache) {
        cacheRecentJobs(res)
        cacheRecentJobPoster(res)
    }

}