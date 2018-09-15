// /* global chrome */
//
// import {fbMessengerURL} from "./util";
// console.log("HI MANAGER");
// let tabs;
// // let tabID;
// // chrome.tabs.getCurrent(function(tab) {
// //     tabID = tab.id;
// // });
//
// // Ask the background.js script for the current url
// chrome.runtime.sendMessage({
//     greeting: "tabNum"
// }, function(response) {
//     console.log("Response = ", response);
//     if (response.num == 1) {
//         chrome.tabs.update(response.id, {
//             "highlighted": true,
//             "active": true,
//             "pinned": true
//         });
//     } else if (response.num > 1) {
//             chrome.tabs.remove(response.id, function() { });
//
//     }
//
// });
// //
// function pinTab() {
//
//     chrome.tabs.query({
//         "url": fbMessengerURL
//     }, function(tabs) {
//         if (tabs.length = 1) { // Only messenger tab
//             console.log("PINNING");
//             var tabID = tabs[0].id;
//             console.log("Tab ID =" + tabID);
//             // Reference: https://developer.chrome.com/extensions/tabs#method-update
//             chrome.tabs.update(tabID, {
//                 "highlighted": true,
//                 "active": true,
//                 "pinned": true
//             });
//
//         } else if (tabs.length = 2) { // tab needs to be removed
//             console.log("Removing Tab")
//             chrome.tabs.getCurrent(function(tab) {
//                 chrome.tabs.remove(tab.id, function() { });
//             });
//         }
//     });
