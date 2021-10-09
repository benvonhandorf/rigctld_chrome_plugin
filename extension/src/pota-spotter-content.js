import * as object_matcher from "./object_matcher";

let event_handler_debounce = null;

let pota_frequency_regex = /(?<frequency>\d+(?:.?\d+)?)\s*(?<units>[k]?)Hz\s*(?:\((?<mode>\w+)\))?/;
let pota_whitespace_regex = /\s*(?<content>[\w-]+)\s*/
let pota_callsign_unit_regex = /\s*(?<callsign>[\w-]+)\s*@\s*(?<unit>[\w-]+)\s*/

let parse_card_data = (card) => {
    try {
        if (card.classList.contains('spot-card') || card.closest(".v-menu__content") != null) {
            //Either the "add a spot" card or a profile card popped up under the Menu
            return null
        }

        let frequency_text = card.children[2]?.children[2]?.innerText;

        let match = frequency_text?.match(pota_frequency_regex);

        let frequency = parseFloat(match?.groups?.frequency || "0");

        if (match.groups.units === "k") {
            frequency = frequency * 1000;
        } else if (match.groups.units === "M") {
            frequency = frequency * 1000000;
        }

        let mode = match.groups.mode

        if (mode == null) {
            mode = "SSB"
        }

        let callsign_text = card.getElementsByClassName("v-card__title")[0]?.children[0]?.children[0]?.innerText;
        let callsign = null;

        let unit = null;

        if (callsign_text == null) {
            callsign_text = card.getElementsByClassName("v-card__title")[0]?.children[0]?.innerText

            let callsign_unit_match = callsign_text?.match(pota_callsign_unit_regex)

            callsign = callsign_unit_match?.groups?.callsign
            unit = callsign_unit_match?.groups?.unit
        } else {
            callsign = callsign_text?.match(pota_whitespace_regex)?.groups?.content

            let unit_text = card.getElementsByClassName("v-menu")[0]?.innerText

            unit = unit_text?.match(pota_whitespace_regex)?.groups?.content
        }

        let location_text = card.children[2]?.children[1]?.children[1]?.innerText;
        let spot_location = location_text.match(pota_whitespace_regex)?.groups?.content;

        let card_data = {
            frequency: frequency,
            mode: mode,
            callsign: callsign,
            unit: unit,
            location: spot_location
        }

        return card_data;
    } catch (e) {
        console.log(`Failed parsing card with exception ${e}`);
        console.log(card);
        return null;
    }
}

let frequency_click = (evt) => {
    let card = evt.srcElement.closest(".v-card");

    let request = parse_card_data(card)

    request.type = "control";

    console.log(request);
    chrome.runtime.sendMessage(request);
}

let perform_update = () => {
    let cards = document.getElementsByClassName("v-card");
    let spots = [];

    console.log("Updating dom:" + cards.length);

    for (let card of cards) {
        var spot_data = parse_card_data(card);

        if (spot_data == null) {
            continue;
        }

        if (card.children[2] != null && card.children[2].children[2] != null) {
            let frequency_entry = card.children[2].children[2];

            frequency_entry.removeEventListener("click", frequency_click);

            frequency_entry.addEventListener("click", frequency_click)

            if (!frequency_entry.classList.contains("frequency_entry")) {
                frequency_entry.classList.add("frequency_entry");
            }
        }

        spots.push(spot_data)
    }

    let spots_update = {
        program: "pota",
        type: "spots",
        spots: spots
    };

    chrome.runtime.sendMessage(spots_update);

    if (event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = null;
}

let find_card_by_spot = (spot_to_find) => {
    let cards = document.getElementsByClassName("v-card");
    let spots = [];

    console.log("Updating dom:" + cards.length);

    for (let card of cards) {
        var spot_data = parse_card_data(card);

        if (object_matcher.spots_same_unit_and_callsign(spot_to_find, spot_data)) {
            return card;
        }
    }

    return null;
}

var highlighted_card = null;

let highlight_spot = (spot_to_highlight) => {
    const highlighted_card_class = "highlighted_spot";

    if (highlighted_card != null) {
        highlighted_card.classList.remove(highlighted_card_class);
        highlighted_card = null;
    }

    card = find_card_by_spot(spot_to_highlight);

    if (card) {
        card.classList.add(highlighted_card_class);
        highlighted_card = card;
    }
}

let enqueue_update = (evt) => {
    if (evt.srcElement.parentElement.parentElement.className === "refresh-timer") {
        //Don't update every time the timer updates
        return;
    }

    if (event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = window.setTimeout(perform_update, 100);
}

let setup = () => {
    let main_div = document.getElementsByClassName("v-main")[0]

    if (!main_div) {
        console.log("Unable to setup monitor due to missing main content section")
        return;
    }

    main_div.addEventListener("DOMSubtreeModified", enqueue_update);

    console.log("Dom update configured");
};

setup();

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "highlight") {
            highlight_spot(request.spot);

            sendResponse({ ack: true });
        }
    }
);

console.log("Page setup completed");