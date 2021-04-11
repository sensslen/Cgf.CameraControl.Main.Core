import { IBuilder } from './IBuilder';
import { IConfig } from '../Configuration/IConfig';
import { IDisposable } from './IDisposable';
import { ILogger } from '../Logger/ILogger';

export class Factory<TConcrete extends IDisposable> implements IDisposable {
    private _builders: { [key: string]: IBuilder<TConcrete> } = {};
    private _instances: { [key: number]: TConcrete } = {};

    public get(instance: number): TConcrete | undefined {
        return this._instances[instance];
    }

    public async parseConfig(config: IConfig, logger: ILogger): Promise<void> {
        if (this._instances[config.instance]) {
            return;
        }

        const builder = this._builders[config.type];
        if (builder !== undefined) {
            try {
                const instance = await builder.build(config);
                this._instances[config.instance] = instance;
            } catch (error) {
                logger.error(
                    `Factory: building instance from configuration(${JSON.stringify(config)}) failed with (${error})`
                );
            }
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
        for (const key in this._instances) {
            if (Object.prototype.hasOwnProperty.call(this._instances, key)) {
                await this._instances[key].dispose();
            }
        }
    }
}
