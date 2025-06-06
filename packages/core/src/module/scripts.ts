import type { IScriptSocketData } from '../types';
import { listen, type Socket, type TCPSocketListener } from 'bun';
import { Registry } from '@sodacore/registry';
import { Utils } from '@sodacore/di';
import BaseModule from '../base/module';
import { parseScriptPacket } from '../helper/utils';
import ScriptContext from '../context/script';

export default class Scripts extends BaseModule {
	private shouldStart = false;
	private server?: TCPSocketListener<IScriptSocketData>;
	private connections = new Map<symbol, Socket<IScriptSocketData>>();
	private commands: Record<string, { module: any, key: string }> = {};

	public async init() {
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const type = Utils.getMeta('type', 'autowire')(module.constructor);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);

			// Check for valid type and service it is for.
			if (!type || !services.includes('script')) continue;

			// Get the methods.
			const namespace = Utils.getMeta<string>('namespace', 'script')(module.constructor, undefined, '');
			const methods = Utils.getMeta<{ name: string, key: string }[]>('methods', 'script')(module, undefined, []);
			if (!methods || methods.length === 0) continue;

			// Loop through the methods and add them to the commands.
			for (const method of methods) {
				if (!method.name) continue;
				if (this.commands[`${namespace}:${method.name}`]) throw new Error(`Duplicate script name found: ${namespace}:${method.name}`);
				this.commands[`${namespace}:${method.name}`] = {
					module,
					key: method.key,
				};
			}
		}

		// Check whether we should start the CLI server.
		this.shouldStart = this.config.enableCli || false;
	}

	public async start() {
		if (!this.shouldStart) return;
		this.logger.info(`[SCRIPTS]: Starting CLI scripts server.`);
		this.server = listen<IScriptSocketData>({
			port: this.config.port ?? 36445,
			hostname: this.config.hostname ?? 'localhost',
			socket: {
				open: socket => {
					this.logger.info(`[SCRIPTS]: Received a new connection from: ${socket.remoteAddress}.`);
					const uid = Symbol('CLI/SOCKET/CONNECTION');
					socket.data = { uid, authenticated: false, results: {}, userDefined: {}, onExit: [], session: new Map<string, any>() };
					this.connections.set(uid, socket);
				},
				close: socket => {
					this.logger.info(`[SCRIPTS]: Connection: ${socket.remoteAddress} has disconnected.`);
					const uid = socket.data.uid;
					socket.data.onExit.forEach((callback: () => void) => callback());
					if (uid) this.connections.delete(uid);
					else this.logger.warn(`[SCRIPTS]: Connection: ${socket.remoteAddress} does not have a valid UID.`);
				},
				data: (socket, data) => {
					this.handle(socket, data.toString());
				},
				drain: socket => {
					this.logger.info(`[SCRIPTS]: Connection: ${socket.remoteAddress} has drained.`);
				},
				error: (socket, error) => {
					this.logger.error(`[SCRIPTS]: Error on connection: ${socket.remoteAddress}, error: ${error.message}.`);
					const uid = socket?.data?.uid;
					if (uid && socket) {
						this.connections.delete(uid);
						socket.data.onExit.forEach((callback: () => void) => callback());
						socket.terminate();
					} else {
						this.logger.warn(`[SCRIPTS]: Connection: ${socket.remoteAddress} does not have a valid UID.`);
					}
				},
			},
		});
	}

	public async stop() {
		if (this.server) {
			this.server.stop();
			this.server = undefined;
		}
	}

	public hasScripts() {
		return this.shouldStart;
	}

	public getCommands() {
		return Object.keys(this.commands);
	}

	private async handle(socket: Socket<IScriptSocketData>, data: string) {

		// Parse the packet data and ensure it's valid.
		const packet = parseScriptPacket(data);
		if (!packet) {
			this.logger.error(`[SCRIPTS]: Error parsing packet.`);
			socket.write(JSON.stringify({ command: '_:error', context: { message: 'Error parsing packet.' } }));
			return;
		}

		// Destructure the packet.
		const { command, context } = packet;

		// Check if the command exists.
		const commandItem = this.commands[command];
		if (!commandItem || typeof commandItem.module[commandItem.key] !== 'function') {
			this.logger.error(`[SCRIPTS]: Attempted to call a non-existing command: ${command}.`);
			socket.write(JSON.stringify({ command: '_:error', context: { message: `Command ${command} not found.` } }));
			return;
		}

		// Check if the socket is authenticated.
		if (!command.startsWith('_:') && socket.data.authenticated === false) {
			this.logger.error(`[SCRIPTS]: Attempted command without valid socket authentication.`);
			socket.write(JSON.stringify({ command: '_:error', context: { message: 'Socket is not authenticated.' } }));
			return;
		}

		// Note script event dispatch.
		this.logger.info(`[SCRIPTS]: Attempting to call command: ${command}`);

		// Attempt to call the command.
		try {

			// Call the result, passing a new script context object.
			const result = await commandItem.module[commandItem.key](
				new ScriptContext(
					socket,
					command,
					context,
				),
			);

			// Deal with the response.
			if (typeof result === 'string') {
				socket.write(JSON.stringify({ command: '_:menu', context: { message: result } }));
			} else if (typeof result === 'boolean') {
				socket.write(JSON.stringify({ command: `_:${result ? 'menu' : 'exit'}` }));
			}
		} catch (err) {
			this.logger.error(`[SCRIPTS]: Error executing command: ${command}, error: ${err}`);
			socket.write(JSON.stringify({ command: '_:error', context: { error: `Error executing command: ${command}, error: ${err}` } }));
		}
	}
}
