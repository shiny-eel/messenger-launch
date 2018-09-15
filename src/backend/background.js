/* global chrome */
// import {Person} from './util.js';

import { loadPeople } from './util.js'
import { getNameFromURL } from './util.js'
import { fbMessengerURL } from './util.js'
import { plainURL } from './util.js'
import { editMessengerFilePath } from './util.js'
import { Person} from "./util.js";


let currentSuggestText;
let currentSuggestContent;
let desiredURL = "DEFAULT FAKE";
let myPeople; // Let my people go!
let favouriteTabId;
console.log("HELLO WORLD");

loadPeople(function(people) {
    console.log("Found this many people =" + people.length);
    chrome.browserAction.setBadgeText({text: ""+people.length}); // Update extension badge

    myPeople = people;
});
listenToMessengerPage();

// Method to be called when the user types/deletes something
// Changes the suggested options
const maxResults = 5;
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {

    console.log("New input is: " + text);
    currentSuggestText = text;
    queryPeople(text, function(results) {
        console.log(results);
        if (results.length > 0) {
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
    function(text) {
        // The text should be the URL.
        if (text === currentSuggestText) {
            console.log("Default suggestion selected");
            text = currentSuggestContent;
        }
        executeMessengerLaunch(text);
    });

function executeMessengerLaunch(text) {
    goToMessengerTab(text, function(tab) {
        // pinTab(tab, function(tabId) {
            if (text !== plainURL)
                switchToPerson(tab.id);
            listenToMessengerPage();
        });
    // })
}

// Creates/Goes-to the messenger tab, callsback with the tab object.
function goToMessengerTab(text, callback) {
    desiredURL = text;
    var oldTabID
    // Encode user input for special characters , / ? : @ & = + $ #
    console.log("Going to Messenger tab. " +
        "Desired URL =" + desiredURL);

    chrome.tabs.query({
        "url": fbMessengerURL
    }, function(tabs) {
        // if (tabs.length > 1) { // Too many tabs
        //     let i;
        //     for (i = 1; i<tabs.length;i++) {
        //         chrome.tabs.remove(tabs[i].id);
        //     }
        // }
        if (tabs.length === 1) { // Already have 1 tab
            // var tabID = tabs[0].id;
            favouriteTabId = tabs[0].id;
            // console.log("Tab ID =" + tabID);
            // Reference: https://developer.chrome.com/extensions/tabs#method-update
            chrome.tabs.update(favouriteTabId, {
                "highlighted": true,
                "active": true,
                "pinned": true
            }, function(tab) {
                callback(tab);
            });

        } else if (tabs.length === 0) { // Messenger tab needs to be created

            chrome.tabs.create({
                url: text
            }, function(tab) {
                favouriteTabId = tab.id;
                callback(tab);
            });
        }
    });
}

function switchToPerson(tabId) {
    console.log("Switch to editMessenger.js script.");
    // goToDesired(desiredURL);
    chrome.tabs.executeScript(tabId, {
        file: editMessengerFilePath
    });
}
//
// function pinTab(tab, callback) {
//     chrome.tabs.update(tab.id, {
//         "pinned": true
//     }, callback(tab.id));
// }
//
// function startListen() {
//     chrome.tabs.query({
//         "url": fbMessengerURL
//     }, function(tabs) {
//         if (tabs && tabs.length > 0)
//             listenToMessengerPage();
//     });
// }

// Create a listener to update the Messenger Parasite of URL changes
// So the Parasite can add more people to its database
let listening = false;
let unwantedTab = null;
function listenToMessengerPage() {
    if (listening) {
        return;
    }
    listening = true;

    console.log("Starting the update listener.");
    chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
        if (info.url && tab.url.match(fbMessengerURL)) {
            // TODO: Check people before sending update
            // console.log("Messenger tab changed/opened.");
            // console.log("Favourite tab id: ", favouriteTabId);
            if (favouriteTabId && tab.id === favouriteTabId) {
               // all good
                return;
           } else if (favouriteTabId && info.status === "loading") {
                // There is a favourite tab and this isn't it
                if (unwantedTab === tab.id){
                    return;
                }
                unwantedTab = tab.id;
                    chrome.tabs.remove(tab.id, function (entry) {
                        if (chrome.runtime.lastError){
                            //
                       } else { console.log(entry)}
                    });
            
           } else if (info.status === "complete") {
                saveNewPerson(tab);
            }
           executeMessengerLaunch(info.url);

        }
    });

    chrome.tabs.onRemoved.addListener(function(tabId, info){
       if (tabId === favouriteTabId) {
           console.log("Favourite tab closed.");
           favouriteTabId = null;
       }
    });
}

function saveNewPerson(tab) {
    let username = getNameFromURL(tab.url);
    if (!hasPersonAlready(username)) {
        // console.log("Updating the parasite.");

        chrome.tabs.sendMessage(tab.id, {
            urlChange: "true",
            username: username
        });
    }
}

function hasPersonAlready(username) {
    if (!myPeople)
        return false;
    for (let i=0; i<myPeople.length; i++) {
        if (myPeople[i].username == username) {
            console.log("Already have "+username);
            return true;
        }
    }
    return false;
}

// Takes a string input of what the user has entered
// Calls back with list of 'suggest' results
// The order of the results should indicate the strength of the match
function queryPeople(text, callback) {
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
    function(request, sender, sendResponse) {
        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");
        if (request.greeting == "getPerson") {
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
            loadPeople(function(people) {
                myPeople = people;
                chrome.browserAction.setBadgeText({text: ""+people.length}); // Update extension badge
            });
        } else if (request.greeting == "newTab") {
            // console.log("New messenger tab found.");
            // chrome.tabs.query({
            //     "url": fbMessengerURL
            // }, function(tabs) {
            //     console.log("num tabs found, tab id: ", tabs.length, sender.tab.id);
            //     if (tabs.length > 1) {
            //         // Don't need new messenger tab
            //         console.log("removing: "+ sender.tab.id +" | focusing: "+tabs[0].id);
            //         chrome.tabs.remove(sender.tab.id);
            //         // chrome.tabs.update(tabs[0].id, {
            //         //     "highlighted": true,
            //         //     "active": true,
            //         //     "pinned": true
            //         // });
            //     } else if (tabs.length == 1) {
            //         //
            //     }
            //     goToMessengerTab(sender.tab.url);
            //
            // });
        }
    });

