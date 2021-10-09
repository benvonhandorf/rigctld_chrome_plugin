

let evaluate_objects = (subset, superset) => {
    for(const property in subset) {
        if(subset.hasOwnProperty(property)) {
            if(subset[property] != superset[property]) {
                return false;
            }
        }
    }

    return true
}

let evaluate_spot_alerts = (spot) => {
    let alerts_for_program = alerts_by_program[spot.program]

    for(const alert_configuration of alerts_for_program) {
        if(evaluate_objects(alert_configuration, spot)) {
            return true;
        }
    }
}

let evaluate_objects_for_properties = (a, b, properties) => {
    for(const property of properties) {
        if(a[property] != b[property]) {
            return false;
        }
    }

    return true
}

let spots_same_including_frequency = (a, b) => {
    const properties = ["program", "callsign", "unit", "location", "frequency"]

    return evaluate_objects_for_properties(a, b, properties);
}

let spots_same_unit_and_callsign = (a, b) => {
    const properties = ["callsign", "unit"]

    return evaluate_objects_for_properties(a, b, properties);
}