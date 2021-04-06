import { IBuilder } from './IBuilder';
import { IConfig } from '../Configuration/IConfig';
import { IDisposable } from './IDisposable';

export class Factory<TConcrete extends IDisposable> implements IDisposable {
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

    public async builderAdd(builder: IBuilder<TConcrete>): Promise<void> {
        const supportedTypes = await builder.supportedTypes();
        supportedTypes.forEach((type) => {
            if (this._builders[type] === undefined) {
                this._builders[type] = builder;
            }
        });
    }

    public async dispose(): Promise<void> {
        for (let key in this._instances) {
            if (this._instances.hasOwnProperty(key)) {
                await this._instances[key].dispose();
            }
        }
    }
}
