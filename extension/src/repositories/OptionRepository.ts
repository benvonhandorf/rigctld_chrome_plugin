import { ConfigurationOptions } from "../ConfigurationOptions";

export namespace OptionRepository {
    export type ChangeOptions = (updatedOptions: ConfigurationOptions) => void;
    export type RetrieveOptions = () => ConfigurationOptions;

    export class OptionRepository {
        constructor(readonly changeOptions: ChangeOptions, readonly retrieveOptions: RetrieveOptions) {
        }
    }
}
