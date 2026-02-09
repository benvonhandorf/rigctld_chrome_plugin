import Alert from "./Alert";
import { RigInformation } from "./RigConfiguration";
import Spot from "./Spot";
import TabDescriptor from "./TabDescriptor";


export enum MessageType {
    Control = "control",
    Highlight = "highlight",
    HighlightTab = "highlight_tabzs",
    Spots = "spots",
    RetrieveAlerts = "retrieve_alerts",
    Alerts = "alerts",
    RetrieveTabs = "retrieve_tabs",
    Tabs = "tabs",
    NotifyAlerts = "notify_alerts",
    CheckNativeHost = "check_native_host",
    NativeHostStatus = "native_host_status",
};

export interface Message {
    readonly type: MessageType;
};


export class ControlMessage implements Message {
    readonly type = MessageType.Control;
    rig?: RigInformation;

    constructor(readonly spot: Spot) {
    }
}

export class SpotsMessage implements Message {
    readonly type = MessageType.Spots;

    constructor(readonly program: string, readonly spots: Spot[]) {
    }
}

export class RetrieveAlertsMessage implements Message {
    readonly type = MessageType.RetrieveAlerts;
}

export class AlertsMessage implements Message {
    readonly type = MessageType.Alerts;

    constructor(readonly alerts: Alert[]) {
    }
}

export class TabsMessage implements Message {
    type = MessageType.Tabs;

    constructor(readonly tabs: TabDescriptor[]) {
    }
}

export class RetrieveTabsMessage implements Message {
    type = MessageType.RetrieveTabs;
}



export class HighlightMessage implements Message {
    type = MessageType.Highlight;

    constructor(readonly spot: Spot) {
    }
}

export class HighlightTabMessage implements Message {
    type = MessageType.HighlightTab;

    constructor(readonly tab_id: number) {
    }
}

export class NotifyAlertsMessage implements Message {
    readonly type = MessageType.NotifyAlerts;

    constructor(readonly alerts: Alert[]) {
    }
}

export class CheckNativeHostMessage implements Message {
    readonly type = MessageType.CheckNativeHost;
}

export interface NativeHostStatusInfo {
    connected: boolean;
    error?: string;
    version?: string;
}

export class NativeHostStatusMessage implements Message {
    readonly type = MessageType.NativeHostStatus;

    constructor(readonly status: NativeHostStatusInfo) {
    }
}