/* global chrome */

import {loadPeople, savePeople, getNameFromURL, Person} from './util'


"use strict";
// const USERNAME_KEY = "LIST OF PEOPLE";
// const TITLE_KEY = "LIST OF TITLES";
// const maxSaved = 30;

let currentUsernames: string[] = [];
let currentTitles: string[] = [];
let currentPeople: Person[] = [];


console.log("Messenger Parasite Active!");

waitThenStart(beginScript);
// waitThenStart(getConversations);
// getConversations();
// savePeople([],[]);

function addUpdateListener(): void {
    chrome.runtime.onMessage.addListener(
        function (request, sender) {
            console.log("Parasite: " + (sender.tab ?
                "Message from another:" + sender.tab.url :
                "Message from the extension"));
            if (request.urlChange === "true") {
                waitThenStart(function () {
                    let titles = [getCurrentChatTitle()];
                    let unames = [request.username];
                    tryAddPeople(titles, unames);
                });
            }
        });
}

function waitThenStart(callback: () => any) {
    if (document.readyState !== 'complete') {
        window.addEventListener('load', callback);
    } else {
        if (typeof callback === "function") {
            callback();
        }
    }
}

function beginScript() {
    getConversations(function (unames, titles) {
        tryAddPeople(titles, unames, function () {
            addUpdateListener();
        });
    });
}

function tryAddPeople(newTitles: string[], newUsernames: string[], callback?: () => any) {
    sumPeople(newTitles, newUsernames, function (sumTitles, sumUnames, _areNewPeople) {
        // if (areNewPeople) {
            savePeople(sumTitles, sumUnames, function () {
                // Tell the background script of new people
                newPeopleUpdate();
            });
        // }
        if (typeof callback === "function") {
            callback();
        }
    });
}

function sumPeople(newTitles: string[], newUsernames: string[],
                   callback?: (t:string[], u:string[], newPeople:boolean) => any) {

    getPeople(function (people, currentTitles, currentUsernames) {
        // console.log(allUsernames);
        let newPeople = false;
        // let allUsernames = [];
        let newPersonCounter = 0;
        for (let i = 0; i < newTitles.length; i++) {
            let uname = newUsernames[i];
            let title = newTitles[i]
            if (uname && title) {

                if (!currentUsernames.includes(uname)) {
                    // console.log("Adding a person.")
                    currentUsernames.push(uname);
                    currentTitles.push(title);
                    newPersonCounter++;
                    newPeople = true;
                } else {
                    // Remove the person
                    // let cutUnames = currentUsernames.splice(currentUsernames.indexOf(uname));
                    // let cutTitles = currentTitles.splice(currentTitles.indexOf(title));
                    // currentTitles = cutTitles;
                    // currentUsernames = cutUnames;
                    // console.log(currentTitles)
                    // // Add at front of list
                    // currentUsernames.unshift(uname);
                    // currentTitles.unshift(title);
                    // console.log(currentTitles)

                }
            }


        }
        console.log("Added " + newPersonCounter + " to " + people.length + " people.");
        if (typeof callback === "function") {
            callback(currentTitles, currentUsernames, newPeople);
        }
    });
}

function getPeople(callback: (p: Person[], t: string[], u: string[]) => any) {
    if (0) { // Don't need to reload from persistence

        callback(currentPeople, currentTitles, currentUsernames);
        return;
    } else {
        // console.log("Loading from persistence. Should only do ");
        loadPeople(function (people, titles, usernames) {
            currentPeople = people;
            currentTitles = titles;
            currentUsernames = usernames;
            callback(people, titles, usernames);
            return;
        });
    }
}

function newPeopleUpdate(): void {
    chrome.runtime.sendMessage({
        greeting: "newPeople"
    });
}

// document.querySelectorAll("ul[aria-label='Conversation list']")[0].childNodes[1].querySelectorAll("a[role='link']")[0].getAttribute("data-href")
// document.querySelectorAll("ul[aria-label='Conversation list']")[0].childNodes[1].querySelectorAll("a[role='link']")[0].querySelectorAll("span")[0].innerText
function getConversations(callback: (u: string[], t: string[]) => any) {
    console.log("Attempt to find list of conversations");
    let unames: string[] = [];
    let titles: string[] = [];
    try {
        let convos = document.querySelectorAll("ul[aria-label='Conversation list']");

        // console.log("Found convos. ");
        // console.log(convos[0]);
        let nodes = convos[0].childNodes;
        // console.log(nodes);
        // console.log("Found child node convos");
        for (let i = 0; i < nodes.length; i++) {
            let linkClass = (<Element>nodes[i]).querySelectorAll("a[role='link']")[0]
            // console.log(linkClass);
            let convoLink = linkClass.getAttribute("data-href");
            // console.log(convoLink);
            if (convoLink) {
                let uname = getNameFromURL(convoLink)
                if (uname) unames.push(uname);
            }
            let convoTitle = linkClass.querySelectorAll('span')[0].innerText;
            titles.push(convoTitle)
            // console.log(convoTitle);
        }
        console.log("Parasite: Found " + unames.length + " convos.");
        callback(unames, titles);
    } catch (err) {
        console.log("Error trying to find conversations: \n" + err);
    }

}

function getCurrentChatTitle():string {
    // console.log("Parasite: GET TITLE")
    const id = "js_5";
    let realTitle:string = '';

    console.log("Document ready state = " + document.readyState);
    const container = document.getElementById(id);
    try {

        const root = container && container.childNodes.item(0);
        let element : Element = <Element>root

        if (!root && root !== null) {
            console.log("OOPS! No child element under element id -" + id);
            return "No Title";
        } else if (element.childElementCount > 0) {
            realTitle = (<Element>element.childNodes.item(0)).innerHTML;
            console.log("Title [nested] is =" + realTitle);
        } else {
            realTitle = element.innerHTML;
            console.log("Title is =" + element.innerHTML);
        }

    } catch (e) {
        console.warn('Failed to get current chat title.', e)
    }
    return realTitle;
}
