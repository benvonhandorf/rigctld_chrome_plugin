
export enum LocalStorageItems {
    RigSetup = "rig_setup",
}

export enum SyncStorageItems {
    RigInformation = "rig_information",
}

export function getStorageItems() : Promise<any> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (localItems) => {
            chrome.storage.sync.get(null, (syncItems) => {
                let result : any = {}

                Object.assign(result, localItems);
                Object.assign(result, syncItems)

                resolve(result)
            })
        });
    });
}