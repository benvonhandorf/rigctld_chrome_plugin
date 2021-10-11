import { RigInformation } from "../../RigConfiguration";


export namespace RigRepository {
    type ChangeRigActivation = (rig: RigInformation, active: boolean) => void;
    type AddRig = (rig: RigInformation, active: boolean) => void;
    type DeleteRig = (rig: RigInformation) => void;

    class RigRepository {
        constructor(readonly changeRigActivation: ChangeRigActivation, readonly addRig: AddRig, readonly deleteRig: DeleteRig) {
        }
    }
}
