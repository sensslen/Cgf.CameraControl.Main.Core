import { IBuilder } from './IBuilder';
import { IConfig } from './IConfig';

export class Factory<TConcrete> {
    private builders: { [key: string]: IBuilder<TConcrete> } = {};
    private himInstances: { [key: number]: TConcrete } = {};

    public get(instance: number): TConcrete | undefined {
        return this.himInstances[instance];
    }

    public parseConfig(config: IConfig): void {
        if (this.himInstances[config.InstanceNumber]) {
            return;
        }

        let builder = this.builders[config.ControllerType];
        if (builder !== undefined) {
            let hmi = builder.build(config);

            if (hmi === undefined) {
                return;
            }

            this.himInstances[config.InstanceNumber] = hmi;
        }
    }

    public builderAdd(builder: IBuilder<TConcrete>) {
        if (this.builders[builder.Type]) {
            return;
        }

        this.builders[builder.Type] = builder;
    }
}
