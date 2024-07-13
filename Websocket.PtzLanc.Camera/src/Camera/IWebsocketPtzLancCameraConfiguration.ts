import { configSchema } from 'cgf.cameracontrol.main.core';
import { z } from 'zod';

export const websocketPtzLancCameraConfigurationSchema = configSchema.extend({
    connectionUrl: z.string(),
    connectionPort: z.string(),
    panTiltInvert: z.boolean().optional(),
});

export type IWebsocketPtzLancCameraConfiguration = z.infer<typeof websocketPtzLancCameraConfigurationSchema>;
