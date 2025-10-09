import type { ServerWebSocket } from 'bun';
import type { Buffer } from 'node:buffer';
import type { IRoute, IServerWsContext, ITransformFunction } from '../types';
import { Autoload, BaseService, Utils as CoreUtils, Events, Service } from '@sodacore/core';
import { Inject, Utils } from '@sodacore/di';
import { HttpService, type IServerContext } from '@sodacore/http';
import { Registry } from '@sodacore/registry';
import WsContext from '../context/ws';
import WsConnections from '../provider/ws-connections';

@Autoload(25)
@Service()
export default class WsService extends BaseService {
	@Inject() private httpService!: HttpService;
	@Inject() private connections!: WsConnections;
	@Inject() private events!: Events;
	private controllers = new Map<string, IRoute>();

	public async init() {

		// Notify console.
		this.logger.info('[WS]: Attaching WebSocket listeners to the HTTP service.');

		// Attach the listeners to the HTTP service.
		this.httpService.addListener('open', this.handleOpen.bind(this));
		this.httpService.addListener('close', this.handleClose.bind(this));
		this.httpService.addListener('drain', this.handleDrain.bind(this));
		this.httpService.addListener('message', this.handleMessage.bind(this));

		// Let's collect our controllers.
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);

			// Check for valid type and service it is for.
			if (types.length === 0 || !services.includes('ws')) continue;

			// If a controller type.
			if (types.includes('controller')) {

				// Define the namespace.
				const namespace = Utils.getMeta('namespace', 'ws')(module.constructor);
				const exposedMethods = Utils.getMeta<string[]>('exposed', 'ws')(module.constructor, undefined, []);
				const controllerTransformers = Utils.getMeta<ITransformFunction[]>('transformers', 'http')(module.constructor, undefined, []);

				// Loop the exposed methods.
				for (const methodName of exposedMethods) {

					// Define the command.
					const command = `${namespace}:${methodName}`;
					const methodTransformers = Utils.getMeta<ITransformFunction[]>('transformers', 'http')(module, methodName, []);

					// Check for a duplicate.
					if (this.controllers.has(command)) {
						this.logger.warn(`[WS]: Duplicate command found: "${command}".`);
						continue;
					}

					// Check for a namespace.
					this.controllers.set(command, {
						transformers: [...controllerTransformers, ...methodTransformers],
						method: module[methodName].bind(module),
					});
				}
			}
		}

		// Notify console.
		this.logger.info(`[WS]: Registered ${this.controllers.size} controller(s).`);
	}

	/**
	 * Starts the WebSocket/HTTP server, if the HTTP service is not available.
	 */
	public async start() {
		//
	}

	/**
	 * Stops the WebSocket/HTTP server, if the HTTP service is not available.
	 */
	public async stop() {
		//
	}

	private async handleOpen(socket: ServerWebSocket<IServerWsContext>) {

		// Create a new WS context.
		const context = new WsContext(socket);
		const id = context.getId();
		const remoteAddress = context.getRemoteAddress();
		socket.data.uniqueId = id;

		// Notify console.
		this.logger.info(`[WS]: New WebSocket connection from "${remoteAddress}" with ID: "${id}".`);

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
		this.logger.info(`[WS]: WebSocket connection with ID: "${id}" closed with code: "${code}" and reason: "${reason}".`);

		// Let's dispatch an event.
		this.events.dispatch('wsClose', { id }, 'ws');
	}

	private async handleDrain(socket: ServerWebSocket<IServerContext>) {

		// Let's get the ID and connection.
		const id = socket.data.uniqueId;
		const connection = this.connections.getConnection(id);
		if (!connection) throw new Error(`Connection not found for ID: ${id}`);

		// Notify console.
		this.logger.info(`[WS]: WebSocket connection with ID: "${id}" triggered a drain.`);

		// Let's dispatch an event.
		this.events.dispatch('wsDrain', { id, connection }, 'ws');
	}

	private async handleMessage(socket: ServerWebSocket<IServerContext>, message: string | Buffer) {

		// Let's get the message to a string.
		const content = message.toString();
		if (!CoreUtils.isJson(content)) {
			this.logger.warn(`[WS]: Invalid JSON message received: "${content}", by connection: "${socket.data.uniqueId}".`);
			return;
		}

		// Get the connection.
		const connection = this.connections.getConnection(socket.data.uniqueId);
		if (!connection) {
			this.logger.warn(`[WS]: Connection not found for ID: "${socket.data.uniqueId}".`);
			return;
		}

		// Let's parse the message.
		const { command, context } = JSON.parse(content);

		// Let's check for a valid command.
		if (!command || !this.controllers.has(command)) {
			this.logger.warn(`[WS]: Invalid command received: "${command}", by connection: "${socket.data.uniqueId}".`);
			return;
		}

		// Execute the method.`
		const route = this.controllers.get(command);
		if (!route) throw new Error(`Route not found for command: "${command}" - this looks like a bug.`);

		// Add the data to the connection.
		connection.setData(context);

		// Execute the method.
		let result = await route.method(connection);

		// If no result, do nothing.
		if (typeof result === 'undefined' || result === null) return;

		// Execute any transformers.
		for (const transformer of route.transformers) {
			result = await transformer(connection, result);
		}

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
