import type { IConfig } from '../types';
import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import { file } from 'bun';
import SseConnectionsProvider from '../provider/sse-connections';
import HttpService from '../service/http';
import CorsMiddleware from '../middlewares/cors';
// import FilesMiddleware from '../middlewares/files';

const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

export default class HttpPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;
	public dependencies = [];

	public constructor(protected config: IConfig = { port: 8080 }) {
		super(config);
		this.setup();
	}

	public async install(app: Application) {
		app.register(SseConnectionsProvider);
		app.register(HttpService);
		if (this.config.builtin?.corsMiddleware) {
			app.register(CorsMiddleware);
		}
	}
}
