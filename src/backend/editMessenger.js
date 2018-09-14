/* global chrome */
// import {$,jQuery} from 'jquery';

// export function goToDesired(desiredURL) {
    try {
        // const testURL = "https://www.messenger.com/t/nathan.henderson.7739";
        // const loadWaitMillis = 400;
        // getDesiredURL(function(url) {
        //     editThing(url);
        // });

         getDesiredURL(function (url) {
            scrollToFind(url);
            //  loadMorePeople();
         });
        console.log("End of editMessenger.js");
    } catch (err) {
        console.log("Error: You might not be able to call the extension" +
            " while in the messenger page multiple times.");
        console.log(err);
    }
// }

function scrollToFind(url) {
    clickFind(1, url, clickFind, function() {
        console.log("Done.");
    })
    // const loadWaitMillis = 400;
    //
    // let maxScrolls = 6;
    // let scrollCount = 1;
    // let i;
    // if (!editThing(url)) {
    //
    //     // let intervals = setInterval(function () {
    //     for (i = 0; i < maxScrolls; i++) {
    //         if (!editThing(url) && scrollCount < maxScrolls) {
    //             console.log("Executing scroll down");
    //             loadMorePeople(function () {
    //                 scrollCount++;
    //             });
    //
    //         } else {
    //             console.log("Finished scrolling.");
    //             break;
    //             // clearInterval(intervals);
    //         }
    //     }
    //     // }, loadWaitMillis);
    // }
}

function clickFind(iter, url, selfcall, callback) {
    let maxScrolls = 20;
    if (!editThing(url) && iter <= maxScrolls) {
        // console.log("Executing scroll down", iter);
        loadMorePeople(function () {
            iter++;
            setTimeout(function(){
                selfcall(iter, url, clickFind, callback);
            }, 250);
        });

    } else {
        console.log("Finished scrolling.");
        callback();
    }

}

function editThing(url) {
    console.log("Attempting to switch to this tab =" + url);
    var button = document.querySelectorAll("a[data-href='" + url + "']");

    // console.log(typeof searchBox);
    if (button == null) {
        console.log("Did not find the element.");
    } else if (button.length < 1) {
        // console.log("0 results found.");
        return false;
    } else {
        console.log("This is the button to click: ")
        console.log(button);
        button[0].click();
        return true;
    }
    // searchBox.click();
}

function loadMorePeople(callback) {

    let headings = document.evaluate("//a[contains(., 'Show older')]", document, null, XPathResult.ANY_TYPE, null);
    let showOlderButton = headings.iterateNext();
    console.log(showOlderButton)
    if (showOlderButton) {
        console.log("Clicking: Load more");
        showOlderButton.click();
    }
    // clearInterval(clicktervals);
    callback();
    return;
}
    // let waitToClick = 50;
    // let timeout = 5;
    // let iters = 1;
    // let headings = document.evaluate("//a[contains(., 'Show older')]", document, null, XPathResult.ANY_TYPE, null );
    // let showOlderButton = headings.iterateNext();
    // showOlderButton.click();

    // let clicktervals = setInterval(function () {
        // } else {
        //     iters++;
        //     console.log("Still trying", iters);
        //
        //     if (iters > timeout) {
        //         // clearInterval(clicktervals);
        //         callback();
        //         return;
        //     }
            // Keep trying
        // }

    // }, waitToClick);
    // let lista = document.querySelectorAll("[placeholder=\"Search Messenger\"]");
    // let searchBar = lista[0];
    // lista.value("TEST");
    // searchBar.setRangeText("TEST");
    //
    // var clickEvent = new MouseEvent("click", {
    //     "view": window,
    //     "bubbles": true,
    //     "cancelable": false
    // });

    // searchBar.dispatchEvent(clickEvent);
    // searchBar.click();
    // searchBar.value = "NEW TEST";
    // var e = new Event("keypress");
    // e.which = 13; //enter keycode
    // e.keyCode = 13;
   // searchBar.dispatchEvent(e);

// }


function scrollDown(amount, callback) {
    const scrollPanelId = "js_8";

    let scrollPanel = document.getElementById(scrollPanelId);
    if (scrollPanel && amount) {
        console.log(scrollPanel);
        console.log("Height is =" + scrollPanel.clientHeight +
            " Amount is =" + amount);
        let newPos = (scrollPanel.clientHeight - 100) * amount;
        console.log("Scrolling to pos=" + newPos)
        // scrollPanel.scrollTop = newPos;
        scrollPanel.scrollBy(0, newPos);
    } else {
        console.log("Couldn't find scroll panel using id=" + scrollPanelId);
    }
    if (typeof callback === "function") {
        callback();
    }

}

// Gives the callback a single param - the desired URL.
function getDesiredURL(callback) {
    console.log("GETTING DESIRED URL FROM BACKGROUND.JS")

    // Ask the background.js script for the current url
    chrome.runtime.sendMessage({
        greeting: "getDesiredURL"
    }, function(response) {
        console.log("URL to go to = " + response.url);

        if (typeof callback === "function") {
            callback(response.url);
        }
    });

}
