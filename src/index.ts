import { Core } from 'cgf.cameracontrol.main.core';
import { F310Builder, Rumblepad2Builder } from 'cgf.cameracontrol.main.gamepad';
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';
import yargs = require('yargs/yargs');

let logger = new Logger();
let core = new Core();

core.HmiFactory.builderAdd(new F310Builder(logger, core.MixerFactory));
core.HmiFactory.builderAdd(new Rumblepad2Builder(logger, core.MixerFactory));

const argv = yargs(process.argv.slice(2)).options({
    config: { type: 'string', default: path.join(__dirname, 'config.json') },
}).argv;

let config = JSON.parse(fs.readFileSync(argv.config).toString());

core.bootstrap(logger, config);
