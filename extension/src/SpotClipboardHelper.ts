import Spot from './Spot';
import { optionRepository } from './repositories/DataCache';

export function copySpotToClipboard(spot: Spot) : void {
    var clipboardData = '';

    if (optionRepository.retrieveOptions().copyCallsign) {
        clipboardData = clipboardData + spot.callsign;
    }

    if (optionRepository.retrieveOptions().copyUnit) {
        if (clipboardData.length > 0) {
            clipboardData = clipboardData + ",";
        }

        clipboardData = clipboardData + spot.unit;
    }

    if (clipboardData.length > 0) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(clipboardData)
                .then(() => {
                    console.log('Clipboard updated');
                })
                .catch((e) => {
                    console.log(`unable to copy to clipboard => ${e}`);
                })
        }
    } else {
        console.log('Unable to copy spot data - no clipboard access')
    }
}