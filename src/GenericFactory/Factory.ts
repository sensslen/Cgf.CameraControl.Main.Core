import { IBuilder } from './IBuilder';
import { IConfig } from '../Configuration/IConfig';

export class Factory<TConcrete> {
    private _builders: { [key: string]: IBuilder<TConcrete> } = {};
    private _instances: { [key: number]: TConcrete } = {};

    public get(instance: number): TConcrete | undefined {
        return this._instances[instance];
    }

    public parseConfig(config: IConfig): void {
        if (this._instances[config.instance]) {
            return;
        }

        let builder = this._builders[config.type];
        if (builder !== undefined) {
            let instance = builder.build(config);

            if (instance === undefined) {
                return;
            }

            this._instances[config.instance] = instance;
        }
    }

    public builderAdd(builder: IBuilder<TConcrete>) {
        builder.Types.forEach((type) => {
            if (this._builders[type] === undefined) {
                this._builders[type] = builder;
            }
        });
    }
}
