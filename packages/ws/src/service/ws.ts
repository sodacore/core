import type { ServerWebSocket } from 'bun';
import type { Buffer } from 'node:buffer';
import type { IConfig, IServerWsContext } from '../types';
import { Autoload, BaseService, Utils as CoreUtils, Events, Service } from '@sodacore/core';
import { Inject, Utils } from '@sodacore/di';
import { HttpService, type IServerContext } from '@sodacore/http';
import { Registry } from '@sodacore/registry';
import WsContext from '../context/ws';
import WsConnections from '../provider/ws-connections';

export type Constructor<K> = { new(): K };
@Autoload(25)
@Service()
export default class WsService extends BaseService {
	@Inject('@ws:config') private config!: IConfig;
	@Inject() private httpService!: HttpService;
	@Inject() private connections!: WsConnections;
	@Inject() private events!: Events;
	private controllers = new Map<string, (context: WsContext) => Promise<any>>();
	private middlewares: any[] = [];

	public async init() {

		// Notify console.
		this.logger.info('[PLUGIN/WS]: Attaching WebSocket listeners to the HTTP service.');

		// Let's attach some listeners.
		this.httpService.addListener('open', this.handleOpen.bind(this));
		this.httpService.addListener('close', this.handleClose.bind(this));
		this.httpService.addListener('drain', this.handleDrain.bind(this));
		this.httpService.addListener('message', this.handleMessage.bind(this));

		// Let's collect our controllers.
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const type = Utils.getMeta('type', 'autowire')(module.constructor);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);

			// Check for valid type and service it is for.
			if (!type || !services.includes('ws')) continue;

			// If a middleware type.
			if (type === 'middleware') {
				this.middlewares.push(module);
				continue;
			}

			// If a controller type.
			if (type === 'controller') {

				// Define the namespace.
				const namespace = Utils.getMeta('namespace', 'ws')(module.constructor);
				const exposedMethods = Utils.getMeta<string[]>('exposed', 'ws')(module.constructor, undefined, []);

				// Loop the exposed methods.
				for (const methodName of exposedMethods) {

					// Define the command.
					const command = `${namespace}:${methodName}`;

					// Check for a duplicate.
					if (this.controllers.has(command)) {
						this.logger.warn(`[PLUGIN/WS]: Duplicate command found: "${command}".`);
						continue;
					}

					// Check for a namespace.
					this.controllers.set(command, module[methodName].bind(module));
				}
			}
		}

		// Notify console.
		this.logger.info(`[PLUGIN/WS]: Registered ${this.controllers.size} controller(s).`);

		// Setup the config items.
		const configKeys = Object.keys(this.config).filter(key => !['port', 'path'].includes(key));
		configKeys.forEach(key => this.httpService.setConfig(key, (<any> this.config)[key]));
	}

	private async handleOpen(socket: ServerWebSocket<IServerWsContext>) {

		// Create a new WS context.
		const context = new WsContext(socket);
		const id = context.getId();
		const remoteAddress = context.getRemoteAddress();
		socket.data.uniqueId = id;

		// Notify console.
		this.logger.info(`[PLUGIN/WS]: New WebSocket connection from "${remoteAddress}" with ID: "${id}".`);

		// Add the connection.
		this.connections.addConnection(id, context);

		// Let's dispatch an event.
		this.events.dispatch('wsOpen', {
			id,
			remoteAddress,
			connection: context,
		}, 'ws');
	}

	private async handleClose(socket: ServerWebSocket<IServerContext>, code: number, reason: string) {

		// Let's get the ID and connection.
		const id = socket.data.uniqueId;
		const connection = this.connections.getConnection(id);
		if (!connection) throw new Error(`Connection not found for ID: ${id}`);

		// Let's remove the context.
		this.connections.removeConnection(id);

		// Notify console.
		this.logger.info(`[PLUGIN/WS]: WebSocket connection with ID: "${id}" closed with code: "${code}" and reason: "${reason}".`);

		// Let's dispatch an event.
		this.events.dispatch('wsClose', { id }, 'ws');
	}

	private async handleDrain(socket: ServerWebSocket<IServerContext>) {

		// Let's get the ID and connection.
		const id = socket.data.uniqueId;
		const connection = this.connections.getConnection(id);
		if (!connection) throw new Error(`Connection not found for ID: ${id}`);

		// Notify console.
		this.logger.info(`[PLUGIN/WS]: WebSocket connection with ID: "${id}" triggered a drain.`);

		// Let's dispatch an event.
		this.events.dispatch('wsDrain', { id, connection }, 'ws');
	}

	private async handleMessage(socket: ServerWebSocket<IServerContext>, message: string | Buffer) {

		// Let's get the message to a string.
		const content = message.toString();
		if (!CoreUtils.isJson(content)) {
			this.logger.warn(`[PLUGIN/WS]: Invalid JSON message received: "${content}", by connection: "${socket.data.uniqueId}".`);
			return;
		}

		// Get the connection.
		const connection = this.connections.getConnection(socket.data.uniqueId);
		if (!connection) {
			this.logger.warn(`[PLUGIN/WS]: Connection not found for ID: "${socket.data.uniqueId}".`);
			return;
		}

		// Let's parse the message.
		const { command, data } = JSON.parse(content);

		// Let's check for a valid command.
		if (!command || !this.controllers.has(command)) {
			this.logger.warn(`[PLUGIN/WS]: Invalid command received: "${command}", by connection: "${socket.data.uniqueId}".`);
			return;
		}

		// Execute the method.`
		const method = this.controllers.get(command);
		if (!method) throw new Error(`Method not found for command: "${command}" - this looks like a bug.`);

		// Add the data to the connection.
		connection.setData(data);

		// Execute the method.
		const result = await method(connection);

		// If no result, do nothing.
		if (typeof result === 'undefined' || result === null) return;

		// If result is of type number or string.
		if (['number', 'string', 'boolean'].includes(typeof result)) {
			return connection.send(command, { result });
		}

		// If result is an object.
		if (typeof result === 'object') {
			return connection.send(command, result);
		}
	}
}
