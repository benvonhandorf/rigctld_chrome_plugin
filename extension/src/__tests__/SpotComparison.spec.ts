import { describe, it } from "jest-circus";
import Alert from "../Alert";

import * as object_matcher from "../object_matcher";

describe('object matcher', () => {
    test('spotsSameIncludingFrequency should match duplicate', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameIncludingFrequency(new_match, existing_alert)

        expect(result).toBeTruthy();
    })

    test('spotsSameIncludingFrequency should not match different frequency in same band', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10109000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameIncludingFrequency(new_match, existing_alert)

        expect(result).toBeFalsy();
    })

    test('spotsSameIncludingFrequency should not match different callsign', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IF",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameIncludingFrequency(new_match, existing_alert)

        expect(result).toBeFalsy();
    })

    test('spotsSameIncludingFrequency should not match different unit', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-5555",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameIncludingFrequency(new_match, existing_alert)

        expect(result).toBeFalsy();
    })

    test('spotsSameUnitAndCallsign should not match different unit', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-5555",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameUnitAndCallsign(new_match, existing_alert)

        expect(result).toBeFalsy();
    })

    test('spotsSameUnitAndCallsign should not match different callsign', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IF",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameUnitAndCallsign(new_match, existing_alert)

        expect(result).toBeFalsy();
    })

    test('spotsSameUnitAndCallsign should match different band', () => {
        let existing_alert: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 14010000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };
    
        let new_match: Alert = {
            "alert_id": "0213ec41-f094-45a4-aa29-a20f822bacc2",
            "alert_fields": [
                "program",
                "callsign"
            ],
            "frequency": 10108000,
            "mode": "CW",
            "callsign": "KD8IE",
            "program": "pota",
            "unit": "K-9473",
            "location": "US-OH",
            "tab_id": 410
        };

        const result = object_matcher.spotsSameUnitAndCallsign(new_match, existing_alert)

        expect(result).toBeTruthy();
    })

})