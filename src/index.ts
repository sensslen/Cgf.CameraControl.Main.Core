import * as fs from 'fs';
import * as path from 'path';

import { Fx10Builder, Rumblepad2Builder } from 'cgf.cameracontrol.main.gamepad';

import { Core } from 'cgf.cameracontrol.main.core';
import { Logger } from './Logger';
import yargs = require('yargs/yargs');

async function run(configPath: string) {
    const config = JSON.parse(fs.readFileSync(configPath).toString());

    const logger = new Logger();
    const core = new Core();

    await core.hmiFactory.builderAdd(new Fx10Builder(logger, core.mixerFactory), logger);
    await core.hmiFactory.builderAdd(new Rumblepad2Builder(logger, core.mixerFactory), logger);

    await core.bootstrap(logger, config);
}

const argv = yargs(process.argv.slice(2)).options({
    config: { type: 'string', default: path.join(__dirname, 'config.json') },
}).argv;

run(argv.config);
