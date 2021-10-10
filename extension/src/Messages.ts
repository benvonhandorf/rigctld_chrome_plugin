import Spot from "./Spot";


export enum MessageType {
    Control = "control",
    Highlight = "highlight",
    Spots = "spots",
    RetrieveAlerts = "retrieve_alerts"
};

export interface Message {
    type: MessageType;
};

export class ControlMessage implements Message {
    type = MessageType.Control;
    spot: Spot;

    constructor(s: Spot) {
        this.spot = s;
    }
}

export class HighlightMessage implements Message {
    type = MessageType.Highlight;
    spot: Spot;

    constructor(s: Spot) {
        this.spot = s;
    }
}
