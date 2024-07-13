import { configSchema } from 'cgf.cameracontrol.main.core';
import { z } from 'zod';

export const signalrPtzLancCameraConfigurationSchema = configSchema.extend({
    connectionUrl: z.string(),
    connectionPort: z.string(),
    panTiltInvert: z.boolean().optional(),
});

export type ISignalrPtzLancCameraConfiguration = z.infer<typeof signalrPtzLancCameraConfigurationSchema>;
