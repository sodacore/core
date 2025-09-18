import type { IConfig } from '../types';
import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import { file } from 'bun';
import SseConnectionsProvider from '../provider/sse-connections';
import HttpService from '../service/http';
import CorsMiddleware from '../middlewares/cors';

/**
 * Initialises the package file and pulls the data from that
 * ready for the plugin to use.
 */
const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

/**
 * The HTTP plugin for Sodacore, this will provide the HTTP service
 * and the controller decorators for building a HTTP powered RESTful
 * API with ease.
 * @class HttpPlugin
 * @implements {IPlugin}
 * @extends {BasePlugin}
 * @default
 */
export default class HttpPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;
	public dependencies = [];

	/**
	 * Will initialise the HttpPlugin, called usually by the autowire
	 * module to setup.
	 * @param config The configuration for the plugin.
	 * @constructor
	 */
	public constructor(protected config: IConfig = { port: 8080 }) {
		super(config);
		this.setup();
	}

	/**
	 * Will be called by the autowire module of the sodacore
	 * core application to initialise the given modules.
	 * @param app Application
	 * @returns void
	 */
	public async install(app: Application) {
		app.register(SseConnectionsProvider);
		app.register(HttpService);
		if (this.config.builtInMiddlewares?.cors) {
			app.register(CorsMiddleware);
		}
	}
}
