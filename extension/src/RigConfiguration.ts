import { number, string } from "prop-types";

export enum RigType {
    Rigctld = "rigctld",
    Gqrx = "gqrx"
}

export class RigConfiguration {
    constructor(readonly host: string, readonly port: number) {
    }
}

export class RigInformation {
    constructor(readonly id: string, readonly name: string, readonly type: RigType, readonly config: RigConfiguration) {

    }
}