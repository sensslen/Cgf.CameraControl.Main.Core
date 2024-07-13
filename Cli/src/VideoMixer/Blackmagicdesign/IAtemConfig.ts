import { configSchema } from 'cgf.cameracontrol.main.core';
import { z } from 'zod';

export const atemConfigurationSchema = configSchema.extend({
    ip: z.string(),
    mixEffectBlock: z.number().int().positive(),
});

export type IAtemConfiguration = z.infer<typeof atemConfigurationSchema>;
