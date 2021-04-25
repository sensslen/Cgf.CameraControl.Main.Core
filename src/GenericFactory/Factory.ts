import { IBuilder } from './IBuilder';
import { IConfig } from '../Configuration/IConfig';
import { IDisposable } from './IDisposable';
import { ILogger } from '../Logger/ILogger';

export class Factory<TConcrete extends IDisposable> implements IDisposable {
    private _builders: { [key: string]: IBuilder<TConcrete> } = {};
    private _instances: { [key: number]: TConcrete } = {};

    public get(instance: number): TConcrete | undefined {
        if (Object.prototype.hasOwnProperty.call(this._instances, instance)) {
            return this._instances[instance];
        }
        return undefined;
    }

    public async parseConfig(config: IConfig, logger: ILogger): Promise<void> {
        if (Object.prototype.hasOwnProperty.call(this._instances, config.instance)) {
            return;
        }

        if (Object.prototype.hasOwnProperty.call(this._builders, config.type)) {
            const builder = this._builders[config.type];
            try {
                const instance = await builder.build(config);
                this._instances[config.instance] = instance;
            } catch (error) {
                logger.error(
                    `Factory: building instance of configuration(${JSON.stringify(config)}) failed with (${error})`
                );
            }
        }
    }

    public async builderAdd(builder: IBuilder<TConcrete>, logger: ILogger): Promise<void> {
        try {
            const supportedTypes = await builder.supportedTypes();
            supportedTypes.forEach((type) => {
                if (this._builders[type] === undefined) {
                    this._builders[type] = builder;
                }
            });
        } catch (error) {
            logger.error(`Factory: Failed to add builder - ${error}`);
        }
    }

    public async dispose(): Promise<void> {
        for (const key in this._instances) {
            if (Object.prototype.hasOwnProperty.call(this._instances, key)) {
                try {
                    await this._instances[key].dispose();
                } catch (_error) {
                    // catch left empty on purpose, as we dispose on best effort
                }
            }
        }
    }
}
