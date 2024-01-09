import { configSchema } from 'cgf.cameracontrol.main.core';
import { z } from 'zod';

export const websocketPtzLancCameraConfigurationSchema = configSchema.extend({
    connectionUrl: z.string(),
    connectionPort: z.string(),
});

export type IWebsocketPtzLancCameraConfiguration = z.infer<typeof websocketPtzLancCameraConfigurationSchema>;
