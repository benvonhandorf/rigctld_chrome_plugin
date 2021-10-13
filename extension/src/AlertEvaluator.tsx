import Alert from "./Alert";
import AlertConfiguration from "./AlertConfiguration";
import Spot from "./Spot";
import * as object_matcher from "./object_matcher";


class BandRange {
    constructor(readonly min: number, readonly max: number) { }

    matches(frequency: number): boolean {
        return frequency <= this.max && frequency >= this.min;
    }
}
type BandRanges = { [bandName: string]: BandRange }
const FREQUENCY_RANGES: BandRanges = {
    "40m": new BandRange(7000000, 7300000),
    "20m": new BandRange(14000000, 14350000),
}

type ModeSet = { [modeAlias: string]: string[] }
const MODE_OVERRIDES: ModeSet = {
    "DIGITAL": ["FT4", "FT8", "PSK31", "RTTY"]
}

export const evaluateFrequencyForBands = (frequency: number, bands: string[]): boolean => {
    for (const band of bands) {
        let bandRange = FREQUENCY_RANGES[band]

        if (bandRange && bandRange.matches(frequency)) {
            return true;
        }
    }

    return false;
}

export const evaluateMode = (spotMode: string, modes: string[]): boolean => {
    for (const mode of modes) {
        if (mode === spotMode) {
            return true;
        } else if (MODE_OVERRIDES[mode]?.includes(spotMode)) {
            return true;
        }
    }

    return false;
}

export const evaluateSpotAlerts = (spot: Spot, alertConfigurations: AlertConfiguration[]): Alert | undefined => {
    let alertsForProgram = alertConfigurations?.filter((alert_config: AlertConfiguration) => alert_config?.program?.includes(spot.program));

    if (alertsForProgram == null) {
        return undefined;
    }

    for (const alertConfig of alertsForProgram) {
        let directComparisonProperties = []
        let failedMatch = false;
        let matchingFields: string[] = [];

        for (const property in alertConfig) {
            if (property === "band") {
                let bands = alertConfig["band"]

                if (bands && evaluateFrequencyForBands(spot.frequency, bands)) {
                    matchingFields.push("band")
                } else {
                    failedMatch = true;
                    break;
                }
            } else if (property === "mode") {
                let modes = alertConfig["mode"]

                if (modes && evaluateMode(spot.mode, modes)) {
                    matchingFields.push("mode")
                } else {
                    failedMatch = true;
                    break;
                }
            } else if (property === "program") {
                //Already handled above, but account for the match
                matchingFields.push("program")
            } else {
                directComparisonProperties.push(property);
            }
        }

        if (directComparisonProperties) {
            if (object_matcher.evaluateObjectsForProperties(alertConfig, spot, directComparisonProperties)) {
                matchingFields.push(...directComparisonProperties);
            } else {
                failedMatch = true;
            }
        }

        if (!failedMatch && matchingFields.length) {
            let alert: Alert = {
                alert_id: alertConfig.alert_id,
                alert_fields: matchingFields,
                frequency: spot.frequency,
                mode: spot.mode,
                callsign: spot.callsign,
                program: spot.program,
                unit: spot.unit,
                location: spot.location,
                tab_id: spot.tab_id
            };

            return alert;
        }
    }

    return undefined;
}