import { Schema } from 'ajv';
export declare class ConfigValidator {
    private _ajv;
    validate<TExpected>(config: any, schema: Schema | string): TExpected | undefined;
    errorGet(): string;
}
