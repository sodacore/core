import type { ILoggerType, IThreadController, IThreadMessage } from '../types';
import process from 'node:process';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { spawn, type Subprocess } from 'bun';
import { v4 } from 'uuid';
import BaseModule from '../base/module';
import ThreadContext from '../context/thread';
import { PATH_THREAD_WRAPPER } from '../helper/constants';

/**
 * The threads module is responsible for managing all threads, it will
 * spawn a thread for each thread found in the registry and send the
 * init and start commands to each thread.
 * @class Threads
 * @extends BaseModule
 * @default
 */
export default class Threads extends BaseModule {
	private threads = new Map<string, Subprocess>();
	private queue = new Map<string, { resolve: any, timeout?: number, createdAt?: number }>();
	private controllers: Record<string, IThreadController> = {};
	private timer: any;

	/**
	 * Initialise the threads module, this will spawn a thread for each
	 * thread found in the registry and send the init command to each
	 * thread.
	 * @returns void
	 * @async
	 */
	public async init() {

		// Let's process all controllers.
		// Let's look for controllers/middleware.
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);
			const namespace = Utils.getMeta<string>('namespace', 'thread')(module.constructor, undefined, '');

			// Check for valid type and service it is for.
			if (types.length === 0) continue;

			// If a controller type.
			if (types.includes('controller') && services.includes('thread')) {
				this.controllers[namespace] = (module);
			}
		}

		// Notify the count of controllers.
		this.logger.info(`[THREADS]: Found ${Object.keys(this.controllers).length} thread controller(s).`);

		// Collect all threads, and note the count.
		const threadKeys = Registry.search('@sodacore:thread:');
		for (const key of threadKeys) {
			const thread = Registry.get(key);
			if (!thread) continue;
			this.createThread(thread);
		}

		// Notify the logger.
		this.logger.info(`[THREADS]: Initialising ${this.threads.size} threads.`);

		// Send the init command.
		await Promise.all(Array.from(this.threads.values()).map(thread => {
			return new Promise<boolean>(resolve => {
				const uid = v4();
				thread.send({ uid, command: '@init', context: {
					registry: Registry.export(),
				} });
				this.queue.set(uid, { resolve });
			});
		}));

		// Trigger the queue cleaner.
		this.timer = setInterval(() => {
			this.handleQueueTimeout();
		}, 1_000);
	}

	/**
	 * Start all threads.
	 * @returns void
	 * @async
	 */
	public async start() {
		await Promise.all(Array.from(this.threads.values()).map(thread => {
			return new Promise<boolean>(resolve => {
				const uid = v4();
				thread.send({ uid, command: '@start' });
				this.queue.set(uid, { resolve });
			});
		}));
	}

	/**
	 * Stop all threads.
	 * @returns void
	 * @async
	 */
	public async stop() {
		clearTimeout(this.timer);
		this.logger.info(`[THREADS]: Stopping ${this.threads.size} thread(s).`);
		Array.from(this.threads.values()).map(thread => thread.kill());
		this.logger.info(`[THREADS]: Successfully stopped ${this.threads.size} thread(s).`);
	}

	/**
	 * Will add a promise to the queue, ready to be resolved when
	 * the thread returns it, this is for the thread provider so
	 * it can register listeners.
	 * @param uid The UID of the request.
	 * @param resolve The promise's resolve method.
	 */
	public addToQueue(uid: string, resolve: (value: unknown) => void, timeout = 5000) {
		this.queue.set(uid, { resolve, timeout, createdAt: Date.now() });
	}

	/**
	 * Will get a thread by it's class name.
	 * @param name The thread's class name.
	 * @returns Subprocess | null
	 */
	public getThread(name: string) {
		return this.threads.get(name) ?? null;
	}

	/**
	 * Create a thread.
	 * @param thread The thread to create.
	 * @private
	 */
	private createThread(thread: any) {

		// Get the file to load.
		const filename = Utils.getMeta('filename', 'thread')(thread);
		const flagsFunc = Utils.getMeta<() => Record<string, any>>('flags', 'thread')(thread);
		if (!filename) throw new Error(`Thread filename not found for: ${thread.name}.`);

		// Process any extra flags.
		const extraFlags = flagsFunc ? flagsFunc() : {};
		const processedFlags: string[] = [];
		for (const [key, value] of Object.entries(extraFlags)) {
			const processedValue = typeof value === 'object' ? JSON.stringify(value) : value;
			processedFlags.push(`--${key}=${processedValue}`);
		}

		// Spawn a thread.
		const threadProcess = spawn([
			process.execPath,
			'run',
			PATH_THREAD_WRAPPER,
			`--file=${filename}`,
			...processedFlags,
		], {
			cwd: process.cwd(),
			env: process.env,
			stdout: 'inherit',
			onExit(_proc, exitCode, signalCode, error) {
				console.log('Queue thread exited.', exitCode, signalCode, error);
			},
			ipc: (message, subprocess) => {
				this.handleIpc(message, subprocess);
			},
		});

		// Assign the thread.
		this.threads.set(thread.name, threadProcess);
	}

	/**
	 * Handle the IPC message.
	 * @param message The message to handle.
	 * @returns void
	 * @private
	 */
	private async handleIpc(message: IThreadMessage, subprocess: Subprocess) {

		// Check command for a lifecycle control.
		if (['@init', '@start', '@stop'].includes(message.command) && message.uid) {
			const queue = this.queue.get(message.uid);
			if (!queue) return;
			queue.resolve(true);
			this.queue.delete(message.uid);
			return;
		}

		// Handle logger messages.
		if (message.command === 'log') {
			const context = message.context ?? {};
			const type = context.type ?? 'info';
			this.logger[type as ILoggerType](context.message ?? 'No message given.');
			return;
		}

		// Handle the controller dispatching.
		if (!message.isResult) {

			// Prepare the controller and method.
			const [namespace, methodName] = message.command.split(':');
			const controller = this.controllers[namespace];
			if (!controller) return this.logger.warn(`[THREADS]: No controller found for: "${namespace}".`);

			// Check for valid method.
			const method = controller[methodName];
			if (!method || typeof method !== 'function') return this.logger.warn(`[THREADS]: No method found for: "${message.command}" in controller: "${controller.constructor.name}".`);

			// Create a new context object.
			const threadContext = new ThreadContext(String(message.uid), message.command, subprocess, message.context);

			// Execute the controller method.
			try {
				const result = await method.bind(controller)(threadContext);
				subprocess.send({ uid: message.uid, command: message.command, context: result ?? {}, isResult: true });
			} catch (err) {
				this.logger.error(`[THREADS]: Error in controller "${controller.constructor.name}", method "${methodName}", with message: "${(<Error>err).message}".`);
			}
		} else if (message.uid) {
			const item = this.queue.get(message.uid);
			if (!item) return;
			item.resolve(message.context);
			this.queue.delete(message.uid);
		}
	}

	/**
	 * Handle the queue timeout.
	 * @private
	 */
	private handleQueueTimeout() {
		const now = Date.now();
		for (const [uid, item] of this.queue) {
			if (!item.createdAt || !item.timeout) continue;
			if (now - item.createdAt > (item.timeout ?? 5000)) {
				item.resolve(null);
				this.queue.delete(uid);
			}
		}
	}
}
