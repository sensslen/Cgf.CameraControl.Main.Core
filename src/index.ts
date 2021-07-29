import * as fs from 'fs';
import * as path from 'path';

import { Core } from 'cgf.cameracontrol.main.core';
import { Fx10Builder } from './Gamepad/logitech/Fx10/Fx10Builder';
import { Logger } from './Logger';
import { Rumblepad2Builder } from './Gamepad/logitech/Rumblepad2/Rumblepad2Builder';
import yargs from 'yargs/yargs';

async function run(configPath: string) {
    const config = JSON.parse(fs.readFileSync(configPath).toString());

    const logger = new Logger();
    const core = new Core();

    await core.hmiFactory.builderAdd(new Fx10Builder(logger, core.mixerFactory, core.cameraFactory), logger);
    await core.hmiFactory.builderAdd(new Rumblepad2Builder(logger, core.mixerFactory, core.cameraFactory), logger);

    await core.bootstrap(logger, config);
}

const argv = yargs(process.argv.slice(2))
    .options({
        config: { type: 'string', default: path.join(__dirname, 'config.json') },
    })
    .parseSync();

run(argv.config);
