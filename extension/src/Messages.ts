import Alert from "./Alert";
import { RigInformation } from "./RigConfiguration";
import Spot from "./Spot";


export enum MessageType {
    Control = "control",
    Highlight = "highlight",
    Spots = "spots",
    RetrieveAlerts = "retrieve_alerts",
    Alerts = "alerts"
};

export interface Message {
    type: MessageType;
};


export class ControlMessage implements Message {
    type = MessageType.Control;
    spot: Spot;
    rig?: RigInformation;

    constructor(s: Spot) {
        this.spot = s;
    }
}

export class SpotsMessage implements Message {
    type = MessageType.Spots;
    program: string;
    spots: Spot[];

    constructor(p: string, s: Spot[]) {
        this.program = p;
        this.spots = s;
    }
}

export class RetrieveAlertsMessage implements Message {
    type = MessageType.RetrieveAlerts;
}

export class AlertsMessage implements Message {
    type = MessageType.Alerts;

    constructor(readonly alerts: Alert[]) {
    }
}


export class HighlightMessage implements Message {
    type = MessageType.Highlight;

    constructor(readonly spot: Spot) {
    }
}
