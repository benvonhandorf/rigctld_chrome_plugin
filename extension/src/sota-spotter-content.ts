import { ControlMessage, SpotsMessage } from "./Messages";
import * as object_matcher from "./object_matcher";
import Spot from "./Spot";
import { copySpotToClipboard } from './SpotClipboardHelper';

let event_handler_debounce: any = null;
let setup_handler_token: any = null;
let setup_attempts_remaining = 3;

let sota_callsign_regex = /\s*(?<frequency>\d+(?:.?\d+)?)\s*(?:(?<mode>\w+))?/;
let sota_frequency_regex = /\s*(?<frequency>\d+(?:.?\d+)?)\s*(?:(?<mode>\w+))?/;

let parse_entry_data = (card: HTMLElement): Spot | null => {
    try {
        let frequency_text = (card.children[2] as HTMLElement).innerText;

        let match = frequency_text.match(sota_frequency_regex);

        let frequency = parseFloat(match?.groups?.frequency || "0");

        let mode = match?.groups?.mode?.toUpperCase() || "SSB";

        let callsign = (card.querySelector(".col-7 div span strong") as HTMLElement).innerText
        let unit_text = (card.querySelector(".col-7 a strong") as HTMLElement).innerText
        let spot_location = unit_text.slice(0, unit_text.indexOf('/'))

        //SOTAWatch does all requencies in MHz.  As is tradition.
        frequency = frequency * 1000000;

        let card_data = {
            frequency: frequency,
            mode: mode,
            callsign: callsign,
            unit: unit_text,
            location: spot_location,
            program: "sota"
        };

        return card_data;
    } catch (e) {
        console.log("Unable to parse spot data");
        console.log(card);
        console.log(e);

        return null;
    }
}

let frequency_click = (evt: Event) => {
    let card = (evt.target as HTMLElement).closest(".row") as HTMLElement;

    if (card == null) {
        return;
    }

    let spot = parse_entry_data(card);

    if (spot) {
        let control_message = new ControlMessage(spot);

        console.log(control_message);
        chrome.runtime.sendMessage(control_message);

        copySpotToClipboard(spot);
    }
}

let perform_update = () => {
    let cards = document.querySelectorAll("#ngb-tab-0-panel .row") as NodeListOf<HTMLElement>;

    let spots = [];

    console.log("Updating dom:" + cards.length);

    for (let card of cards) {
        if (card.querySelector('.col-6')) {
            //Header rows
            continue;
        }

        let card_data = parse_entry_data(card);

        if(card_data == null) {
            continue;
        }

        spots.push(card_data);

        let frequency_entry = card.children[2];

        frequency_entry.removeEventListener("click", frequency_click);

        frequency_entry.addEventListener("click", frequency_click)

        if (!frequency_entry.classList.contains("frequency_entry")) {
            frequency_entry.classList.add("frequency_entry");
        }
    }

    let spots_update = new SpotsMessage("sota", spots);

    chrome.runtime.sendMessage(spots_update);

    if (event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = null;
}

let enqueue_update = (evt: Event) => {
    if (event_handler_debounce) {
        window.clearTimeout(event_handler_debounce);
    }

    event_handler_debounce = window.setTimeout(perform_update, 100);
}

let setup = () => {
    window.clearTimeout(setup_handler_token)
    
    let main_div = document.getElementById("ngb-tab-0-panel")

    if (!main_div) {
        console.log("Unable to setup monitor due to missing main content section")

        setup_attempts_remaining = setup_attempts_remaining - 1

        if(setup_attempts_remaining > 0) {
            setup_handler_token = window.setTimeout(setup, 500);
        }

        return;
    }

    main_div.addEventListener("DOMSubtreeModified", enqueue_update);

    console.log("Dom update configured");
};

setup_handler_token = window.setTimeout(setup, 500);

console.log("Page setup completed");