import { configSchema } from 'cgf.cameracontrol.main.core';
import { specialFunctionDefinitionConfigurationSchema } from './SpecialFunctions/ISpecialFunctionDefinition';
import { z } from 'zod';

export enum EButtonDirection {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

const connectionChangeConfigurationSchema = z.object({
    default: z.map(z.nativeEnum(EButtonDirection), z.number().int().positive().optional()),
    alt: z.map(z.nativeEnum(EButtonDirection), z.number().int().positive().optional()).optional(),
    altLower: z.map(z.nativeEnum(EButtonDirection), z.number().int().positive().optional()).optional(),
});

export const gamepadConfigurationSchema = configSchema.extend({
    videoMixer: z.number().int().positive(),
    connectionChange: connectionChangeConfigurationSchema,
    specialFunction: z.object({
        default: z.map(z.nativeEnum(EButtonDirection), specialFunctionDefinitionConfigurationSchema),
        alt: z.map(z.nativeEnum(EButtonDirection), specialFunctionDefinitionConfigurationSchema).optional(),
        altLower: z.map(z.nativeEnum(EButtonDirection), specialFunctionDefinitionConfigurationSchema).optional(),
    }),
    /**
     * This map maps camera indexes to the mixer's input channel.
     * In the map the key is the input number on the mixer and the value is
     * the camera index in the configuration
     */
    cameraMap: z.map(z.number().int().positive(), z.number().int().positive()),
});

export type IConnectionChangeConfiguration = z.infer<typeof connectionChangeConfigurationSchema>;
export type IGamepadConfiguration = z.infer<typeof gamepadConfigurationSchema>;
