import AlertConfiguration from "../AlertConfiguration";
import { RigInformation } from "../RigConfiguration";
import { AlertRepository } from "./AlertRepository";
import { RigRepository } from "./RigRepository";
import { getStorageItems } from '../StorageUtil';
import { OptionRepository } from "./OptionRepository";
import { ConfigurationOptions } from "../ConfigurationOptions";

export const dataCache: any = {}

export const initDataCache = getStorageItems().then((storageItems) => {
    Object.assign(dataCache, storageItems);

    if(dataCache.rig_setup == null) {
        dataCache.rig_setup = [];
    }
});

export async function ensureDataCache() {
    try {
        await initDataCache;
    } catch (e) {
        console.log("Error loading dataCache");
        console.log(e);
    }
}

export const optionRepository: OptionRepository.OptionRepository = {
    changeOptions: function (updatedOptions: ConfigurationOptions): void {
        dataCache.options = updatedOptions;

        chrome.storage.local.set({ options: updatedOptions });
    },
    retrieveOptions: function (): ConfigurationOptions {
        if (dataCache?.options) {
            return dataCache.options;
        } else {
            const defaultOptions = new ConfigurationOptions(true, false);

            return defaultOptions;
        }
    }
}

var storageChangedListener: (changedKeys: string[]) => void = () => {} ;

export function addStorageChangedListener(newListener: (changedKeys: string[]) => void) : void {
    storageChangedListener = newListener;

    ensureDataCache().then( () => {
        storageChangedListener([]);
    })

}

chrome.storage.onChanged.addListener((changes, area) => {
    var changedKeys : string[] = []

    console.log("Storage changed:");
    console.log(changes);

    for (const k in changes) {
        changedKeys.push(k)

        Object.assign(dataCache[k], changes[k].newValue)
    }

    if(changedKeys.length) {
        storageChangedListener(changedKeys);
    }
});

export const rigRepository: RigRepository.RigRepository = {
    changeRigActivation: function (rig: RigInformation, active: boolean): void {
        console.log(`Changing ${rig.name} to ${active}`)

        if (active) {
            if (dataCache?.rig_setup?.includes(rig.id)) {
                console.log(`Rig ${rig.name} already present in rig_setup`);
                return;
            } else {
                dataCache?.rig_setup?.push(rig.id);
            }
        } else {
            if (dataCache?.rig_setup?.includes(rig.id)) {
                let index_index = dataCache?.rig_setup?.indexOf(rig.id);
                dataCache?.rig_setup?.splice(index_index, 1);
            } else {
                console.log(`Rig ${rig.name} already not present in rig_setup`);
                return;
            }
        }
        chrome.storage.local.set({ rig_setup: dataCache.rig_setup });
    },
    addRig: function (rig: RigInformation, active: boolean): void {
        let rigIndex = dataCache.rig_information.findIndex((rig_candidate: RigInformation) => rig_candidate.id === rig.id);

        if (rigIndex !== -1) {
            console.log(`Rig ${rig.name} already present in ${dataCache.rig_information}`)
            return;
        }

        dataCache.rig_information.push(rig) - 1;

        if (active) {
            dataCache?.rig_setup.push(rig.id)
        }

        chrome.storage.local.set({ rig_information: dataCache.rig_information, rig_setup: dataCache.rig_setup });
    },
    deleteRig: function (rigId: string): void {
        let rigIndex = dataCache.rig_information.findIndex((rig_candidate: RigInformation) => rig_candidate.id === rigId);

        if (rigIndex !== -1) {
            dataCache.rig_information.splice(rigIndex, 1);

            dataCache.rig_setup = dataCache.rig_setup.filter((id: string) => id !== rigId);

            chrome.storage.local.set({ rig_information: dataCache.rig_information, rig_setup: dataCache.rig_setup });
        }

    }
}

export const alertRepository: AlertRepository.AlertRepository = {
    addAlertConfiguration: function (alert: AlertConfiguration): void {
        console.log(alert);


        let alertIndex = dataCache.alert_configuration.findIndex((config: AlertConfiguration) => config.alert_id === alert.alert_id);

        if (alertIndex === -1) {
            dataCache.alert_configuration.push(alert);

            chrome.storage.sync.set({ alert_configuration: dataCache.alert_configuration });
        }
    },
    deleteAlertConfiguration: function (alertId: string): void {
        console.log(alert);

        let alertIndex = dataCache.alert_configuration.findIndex((config: AlertConfiguration) => config.alert_id === alertId);

        if (alertIndex !== -1) {
            dataCache.alert_configuration.splice(alertIndex, 1);

            chrome.storage.sync.set({ alert_configuration: dataCache.alert_configuration });
        }
    }
}