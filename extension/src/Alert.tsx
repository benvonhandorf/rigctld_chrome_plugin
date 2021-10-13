
import Spot from "./Spot";

export default interface Alert extends Spot {
    alert_fields: string[];
    [key: string]: any;
}