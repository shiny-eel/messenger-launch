/* global chrome */
// import {Person} from './util.js';

import {loadPeople} from './util'
import {getNameFromURL} from './util'
import {fbMessengerURL} from './util'
import {plainURL} from './util'
import {editMessengerFilePath} from './util'
import {Person, Suggestion} from "./util";
import Tab = chrome.tabs.Tab;


let currentSuggestText: string;
let currentSuggestContent: string;
let desiredURL = "DEFAULT FAKE";
let myPeople: Person[]; // Let my people go!
let favouriteTabId: number | null;
console.log("HELLO WORLD");

loadPeople(function (people) {
    console.log("Found this many people =" + people.length);
    chrome.browserAction.setBadgeText({text: "" + people.length}); // Update extension badge

    myPeople = people;
});
listenToMessengerPage();

// Method to be called when the user types/deletes something
// Changes the suggested options
const maxResults = 5;
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {

    // console.log("New input is: " + text);
    currentSuggestText = text;
    queryPeople(text, function (results: Suggestion[] | null) {
        console.log(results);
        if (results && results.length > 0) {
            currentSuggestContent = results[0].content;
            chrome.omnibox.setDefaultSuggestion({
                description: results[0].description
            });

            let numVisible = Math.max(results.length, maxResults);
            var resultsToReturn = results.slice(1, numVisible - 1);
            // console.log(results.constructor);
            // suggest(results);
            suggest(resultsToReturn);
        } else {
            currentSuggestContent = plainURL;
            chrome.omnibox.setDefaultSuggestion({
                description: "Go to Messenger"
            });
        }
    });
})

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
    function (text) {
        // The text should be the URL.
        if (text === currentSuggestText) {
            console.log("Default suggestion selected");
            text = currentSuggestContent;
        }
        executeMessengerLaunch(text);
    });

function executeMessengerLaunch(text: string) {
    goToMessengerTab(text, function (tab) {
        // pinTab(tab, function(tabId) {
        if (text !== plainURL)
            switchToPerson(tab.id);
        listenToMessengerPage();
    });
    // })
}

// Creates/Goes-to the messenger tab, callsback with the tab object.
function goToMessengerTab(text: string, callback: (tab: any) => any) {
    desiredURL = text;
    // var oldTabID
    // Encode user input for special characters , / ? : @ & = + $ #
    console.log("Going to Messenger tab. " +
        "Desired URL =" + desiredURL);

    chrome.tabs.query({
        "url": fbMessengerURL
    }, function (tabs) {

        if (tabs.length === 1) { // Already have 1 tab
            // var tabID = tabs[0].id;
            favouriteTabId = tabs[0].id ? tabs[0].id : favouriteTabId;
            // console.log("Tab ID =" + tabID);
            if (favouriteTabId) {
                // Reference: https://developer.chrome.com/extensions/tabs#method-update
                chrome.tabs.update(favouriteTabId, {
                    "highlighted": true,
                    "active": true,
                    "pinned": true
                }, function (tab) {
                    callback(tab);
                });
            }

        } else if (tabs.length === 0) { // Messenger tab needs to be created

            chrome.tabs.create({
                url: text,
                pinned: true
            }, function (tab) {
                favouriteTabId = tab.id || null;
                callback(tab);
            });
        }
    });
}

function switchToPerson(tabId: number): void {
    console.log("Switch to editMessenger.js script.");
    // goToDesired(desiredURL);
    chrome.tabs.executeScript(tabId, {
        file: editMessengerFilePath
    });
}

// Create a listener to update the Messenger Parasite of URL changes
// So the Parasite can add more people to its database
let listening = false;
let unwantedTab: number;

function listenToMessengerPage() {
    if (listening) {
        return;
    }
    listening = true;

    console.log("Starting the update listener.");
    chrome.tabs.onUpdated.addListener(function (_tabId, info, tab) {
        if (info.url && tab.url && tab.url.match(fbMessengerURL)) {
            // TODO: Check people before sending update
            // console.log("Messenger tab changed/opened.");
            // console.log("Favourite tab id: ", favouriteTabId);
            if (favouriteTabId && tab.id === favouriteTabId) {
                // all good
                return;
            } else if (favouriteTabId && info.status === "loading") {
                // There is a favourite tab and this isn't it
                if (unwantedTab === tab.id) {
                    return;
                }
                if (tab.id) {
                    unwantedTab = tab.id;
                    chrome.tabs.remove(tab.id, function (entry: any) {
                        if (chrome.runtime.lastError) {
                            //
                        } else {
                            console.log(entry)
                        }
                    });
                }
            } else if (info.status === "complete") {
                saveNewPerson(tab);
            }
            executeMessengerLaunch(info.url);

        }
    });

    chrome.tabs.onRemoved.addListener(function (tabId, _info) {
        if (tabId === favouriteTabId) {
            console.log("Favourite tab closed.");
            favouriteTabId = null;
        }
    });
}

function saveNewPerson(tab: Tab) {
    if (!tab.url || !tab.id) return
    let username = getNameFromURL(tab.url);
    if (username && !hasPersonAlready(username)) {
        // console.log("Updating the parasite.");

        chrome.tabs.sendMessage(tab.id, {
            urlChange: "true",
            username: username
        });
    }
}

function hasPersonAlready(username:string) {
    if (!myPeople)
        return false;
    for (let i = 0; i < myPeople.length; i++) {
        if (myPeople[i].username == username) {
            console.log("Already have " + username);
            return true;
        }
    }
    return false;
}

// Takes a string input of what the user has entered
// Calls back with list of 'suggest' results
// The order of the results should indicate the strength of the match
function queryPeople(text:string, callback:(results:Suggestion[] | null) => any) {
    if (text == 'help') {
        console.log("Help Called For.");
        callback(null);
    } else {
        console.log("Matching with text=" + text);
        let results = [];
        let person;
        let matchCounter = 0;
        for (let i = 0; i < myPeople.length; i++) {
            person = myPeople[i];
            let matchStrength = person.match(text);
            if (matchStrength == 2) {
                console.log("STRONG MATCH FOUND =" + text + " " + person.title);
                results.unshift(person.asSuggestion());
                matchCounter++;
            } else if (matchStrength == 1) {
                results.push(person.asSuggestion());
                matchCounter++;
            } else {
                // Doesn't match
            }
        }
        console.log("Number of matches: " + matchCounter);
        console.log("Number of results: " + results.length);
        callback(results);
    }

}

// Reply to the Messenger Parasite with the URL info
console.log("Starting the url listener.");
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");
        if (request.greeting == "getPerson" && sender.tab) {
            sendResponse({
                username: sender.tab.url
            });
        } else if (request.greeting == "getDesiredURL") {
            console.log("Request for desired URL. sending =" + desiredURL);
            sendResponse({
                url: desiredURL
            });
        } else if (request.greeting == "newPeople") {
            console.log("Parasite found new people.");
            loadPeople(function (people) {
                myPeople = people;
                chrome.browserAction.setBadgeText({text: "" + people.length}); // Update extension badge
            });

        } else if (request.greeting === "getPeople") {
            console.log("Sending all people.");
            sendResponse({
                people: myPeople
            });
        } else if (request.greeting === "launch") {
            console.log("Launching for person.", request.username)
            executeMessengerLaunch(request.username)
        }

    });

