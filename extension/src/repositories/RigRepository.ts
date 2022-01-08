import { RigInformation } from "../RigConfiguration";

export namespace RigRepository {
    export type ChangeRigActivation = (rig: RigInformation, active: boolean) => void;
    export type AddRig = (rig: RigInformation, active: boolean) => void;
    export type DeleteRig = (rig_id: string) => void;

    export class RigRepository {
        constructor(readonly changeRigActivation: ChangeRigActivation, readonly addRig: AddRig, readonly deleteRig: DeleteRig) {
        }
    }
}
