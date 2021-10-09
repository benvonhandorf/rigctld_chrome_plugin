import * as object_matcher from "./object_matcher";

let event_handler_debounce = null;

let sota_frequency_regex = /\s*(?<frequency>\d+(?:.?\d+)?)\s*(?:(?<mode>\w+))?/;

let handle_click = (evt) => {
    let card = evt.srcElement.closest(".row");

    let frequency_text = card.children[2].innerText;

    let match = frequency_text.match(sota_frequency_regex);

    let frequency = parseFloat(match.groups.frequency);

    //SOTAWatch does all requencies in MHz.  As is tradition.
    frequency = frequency * 1000000;

    let request = {
        type: "control",
        frequency: frequency,
        mode: match.groups.mode
    }

    console.log(request);
    chrome.runtime.sendMessage(request);
}

let perform_update = () => {
    let cards = document.getElementById("ngb-tab-0-panel").getElementsByClassName("row");

    console.log("Updating dom:" + cards.length);

    for(let card of cards) {
        if(card.children.length < 3) {
            continue;
        }
        let frequency_entry = card.children[2];

        frequency_entry.removeEventListener("click", handle_click);

        frequency_entry.addEventListener("click", handle_click)

        if(!frequency_entry.classList.contains("frequency_entry")) {
            frequency_entry.classList.add("frequency_entry");
        }
    }

    if(event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = null;
}

let enqueue_update = (evt) => {
    if(evt.srcElement.parentElement.parentElement.className === "refresh-timer") {
        //Don't update every time the timer updates
        return;
    }

    if(event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = window.setTimeout(perform_update, 100);
}

let setup = () => {
    let main_div = document.getElementById("ngb-tab-0-panel")

    if(!main_div) {
        console.log("Unable to setup monitor due to missing main content section")
        return;
    }

    main_div.addEventListener("DOMSubtreeModified", enqueue_update);

    console.log("Dom update configured");
};

setup();

console.log("Page setup completed");