import { number, string } from "prop-types";


export class ConfigurationOptions {
    constructor(readonly copyCallsign: boolean, readonly copyUnit: boolean) {
    }
}