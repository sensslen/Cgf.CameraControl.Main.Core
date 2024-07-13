import { specialFunctionDefinitionConfigurationSchema } from './ISpecialFunctionDefinition';
import { z } from 'zod';

export const specialFunctionConnectionChangeConfigurationSchema = specialFunctionDefinitionConfigurationSchema.extend({
    index: z.number().int().positive(),
});

export type ISpecialFunctionConnectionChangeConfig = z.infer<typeof specialFunctionConnectionChangeConfigurationSchema>;
