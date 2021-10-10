import { number, string } from "prop-types";

export enum RigType {
    Rigctld = "rigctld",
    Gqrx = "gqrx"
}

export class RigConfiguration {
    host: string;
    port: number;

    constructor(h: string, p: number) {
        this.host = h;
        this.port = p;
    }
}

export class RigInformation {
    name: string;
    type: RigType;
    config: RigConfiguration;

    constructor(n: string, t: RigType, cc: RigConfiguration) {
        this.name = n;
        this.type = t;
        this.config = cc;
    }
}