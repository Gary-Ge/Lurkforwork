// A helper you may want to use when uploading new images to the server.
import { renderLogin, renderRegister } from "./login.js";
import { renderProfile } from "./profile.js";
import { render, stopPolling } from "./index.js";
import * as common from "./common.js"
import { renderUpdate } from './update.js';
import { renderAdd, renderUpdateJob } from './addjob.js';

let mostRecentDate = null
let pollingRecent

// Setup nav bar
document.addEventListener("DOMContentLoaded", function() {
    const navbarLinks = document.querySelectorAll(".navbar-nav li a");
    navbarLinks.forEach(function(navbarLink) {
        navbarLink.addEventListener("click", function() {
        const navbarCollapse = document.querySelector(".navbar-collapse");
        navbarCollapse.classList.remove("show");
        });
    });
});

// Add a click event listener to the document
document.addEventListener('click', function (event) {
    // Check if the clicked element is not part of the navbar and the navbar is open
    if (!navbar.contains(event.target) && navbar.classList.contains('show')) {
        // Hide the navbar
        navbar.classList.remove('show');
    }
});

// Send notifications
export function sendNotification(title, content) {
    let notification 
    if (Notification.permission === 'default' || Notification.permission === 'undefined') {
        Notification.requestPermission(function(result) {
            if (result === 'granted') {
                notification = new Notification(title, {
                    body: content,
                    icon: "assets/default-job-icon.svg"
                })
            }
        })
    } else {
        notification = new Notification(title, {
            body: content,
            icon: "assets/default-job-icon.svg"
        })
    }
}

// Ask for a permission to sending notifications
function requestNotificationPermission() {
    Notification.requestPermission(function(result) {
        return result
    })
}

// Parse different URL
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
    // After displaying a page, start a timer polling the server for newly posted jobs
    if (common.getToken() != null) {
        if (mostRecentDate == null) {
            fetchMostRecentJob(setMostRecentJob)
        }
        clearInterval(pollingRecent)
        pollingRecent = setInterval(pollingRecentJobs, 3000)
    }
}

// Polling the server for newly posted jobs
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
        if (error.message == "Invalid token") {
            window.location.hash = "#login"
            return
        }
        if (error.message == "Failed to fetch") {
            if (window.localStorage.getItem("jobs_cache") != null) {
                action(JSON.parse(window.localStorage.getItem("jobs_cache")), false)
            }
        } else common.displayAlert(error.message) 
    })
}

// Cache the jobs into local storage
function cacheRecentJobs(res) {
    window.localStorage.setItem("jobs_cache", JSON.stringify(res))
}

// Cache the poster's names into local storage
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
    // Only need to update the cache when one or more new jobs are posted
    if (recentDate.getTime() == mostRecentDate.getTime()) return
    if (recentDate.getTime() > mostRecentDate.getTime()) sendNotification("A New Job", "A user you are watching has posted a new job, goto or refresh the main page to check it!")
    mostRecentDate = recentDate
    if (cache) {
        cacheRecentJobs(res)
        cacheRecentJobPoster(res)
    }

}