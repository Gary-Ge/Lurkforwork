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
        if (res.length > 0) {
            action(res[0].createdAt)
        } else {
            action("1970-01-01")
        }
    }).catch(error => { common.displayAlert(error.message) })
}

function setMostRecentJob(createdAt) {
    console.log("aaa")
    mostRecentDate = new Date(createdAt)
}

function compareMostRecentJob(createdAt) {
    console.log("bbb")
    let recentDate = new Date(createdAt)
    if (recentDate > mostRecentDate) {
        sendNotification("A New Job", "A user you are watching has posted a new job, goto or refresh the main page to check it!")
    }
    mostRecentDate = recentDate
}