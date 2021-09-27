
var event_handler_debounce = null;

let pota_frequency_regex = /(?<frequency>\d+(?:.?\d+)?)\s*(?<units>[k]?)Hz\s*(?:\((?<mode>\w+)\))?/;

let handle_click = (evt) => {
    let card = evt.srcElement.closest(".v-card");

    let frequency_text = card.children[2].children[2].innerText;

    let match = frequency_text.match(pota_frequency_regex);

    let frequency = parseFloat(match.groups.frequency);

    if(match.groups.units === "k") {
        frequency = frequency * 1000;
    } else if(match.groups.units === "M") {
        frequency = frequency * 1000000;
    }

    let request = {
        frequency: frequency,
        mode: match.groups.mode
    }

    console.log(request);
    chrome.runtime.sendMessage(request);
}

let perform_update = () => {
    let cards = document.getElementsByClassName("v-card");

    console.log("Updating dom:" + cards.length);

    for(let card of cards) {
        if(card.children[2] == null || card.children[2].children[2] == null) {
            continue;
        }
        let frequency_entry = card.children[2].children[2];

        frequency_entry.removeEventListener("click", handle_click);

        frequency_entry.addEventListener("click", handle_click)
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
    let main_div = document.getElementsByClassName("v-main")[0]

    if(!main_div) {
        console.log("Unable to setup monitor due to missing main content section")
        return;
    }

    main_div.addEventListener("DOMSubtreeModified", enqueue_update);

    console.log("Dom update configured");
};

setup();

console.log("Page setup completed");