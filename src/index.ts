import { Core } from 'cgf.cameracontrol.main.core';
import { Fx10Builder, Rumblepad2Builder } from 'cgf.cameracontrol.main.gamepad';
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';
import yargs = require('yargs/yargs');

async function run() {
    let logger = new Logger();
    let core = new Core();

    await core.HmiFactory.builderAdd(new Fx10Builder(logger, core.MixerFactory));
    await core.HmiFactory.builderAdd(new Rumblepad2Builder(logger, core.MixerFactory));

    const argv = yargs(process.argv.slice(2)).options({
        config: { type: 'string', default: path.join(__dirname, 'config.json') },
    }).argv;

    let config = JSON.parse(fs.readFileSync(argv.config).toString());

    await core.bootstrap(logger, config);
}

run();
