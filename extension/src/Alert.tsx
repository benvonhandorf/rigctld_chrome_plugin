
import Spot from "./Spot";

export default interface Alert extends Spot {
    alert_id: string;
    alert_fields: string[];
    [key: string]: any;
}