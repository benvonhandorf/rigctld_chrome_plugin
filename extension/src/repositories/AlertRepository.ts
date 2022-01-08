import AlertConfiguration from "../AlertConfiguration";

export namespace AlertRepository {
    export type AddAlertConfiguration = (rig: AlertConfiguration) => void;
    export type DeleteAlertConfiguration = (alertId: string) => void;

    export class AlertRepository {
        constructor(readonly addAlertConfiguration: AddAlertConfiguration, readonly deleteAlertConfiguration: DeleteAlertConfiguration) {
        }
    }
}
