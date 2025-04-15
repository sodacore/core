import type { IConfig } from '../types';
import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import { file } from 'bun';
import UpgradeMiddleware from '../middleware/upgrade';
import WsConnections from '../provider/ws-connections';
import WsService from '../service/ws';

const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

export default class WsPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;
	public dependencies = ['@sodacore/http'];

	public constructor(protected config: IConfig = {}) {
		super(config);
		this.setup();
	}

	public async install(app: Application) {
		app.register(WsConnections);
		app.register(UpgradeMiddleware);
		app.register(WsService);
	}
}
