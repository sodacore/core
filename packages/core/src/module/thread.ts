import type { IThreadMessage, IThreadQueueItem, IThreadQueueItemWithMeta } from '../types';
import process from 'node:process';
import { Registry } from '@sodacore/registry';

/**
 * This class is responsible for handling the IPC communication
 * between the main thread and the worker threads, it will import
 * the module and call the init, start, and stop methods as required.
 * @class ThreadWrapper
 * @usedby Thread
 * @default
 */
export default class ThreadWrapper {
	private queue = new Map<string, IThreadQueueItemWithMeta>();
	private timer: any;
	public module: any;

	/**
	 * Create a new instance of the ThreadWrapper class.
	 * @param filename The filename of the file this class resides in.
	 * @constructor
	 */
	public constructor(
		protected filename: string,
	) {
		// Create the timer.
		this.timer = setInterval(() => {
			this.handleQueueTimeout();
		}, 1_000);

		// Handle process events.
		process.on('message', this.handleIpc.bind(this));
		process.on('SIGINT', () => this.handleIpc.bind(this)({ command: '@stop' }));
		process.on('beforeExit', () => this.handleIpc.bind(this)({ command: '@stop' }));
	}

	/**
	 * Initialise the module.
	 * @returns void
	 * @async
	 */
	public async init() {

		// Import and instantiate the module.
		const module = await import(this.filename);
		const key = Object.keys(module)[0] ?? 'default';
		this.module = new module[key](this);

		// Verify the module has an init function.
		if (typeof this.module.onInit === 'function') {
			await this.module.onInit();
		}
	}

	/**
	 * Start the module.
	 * @returns void
	 * @async
	 */
	public async start() {

		// Verify the module has a start function.
		if (typeof this.module.onStart === 'function') {
			await this.module.onStart();
		}
	}

	/**
	 * Stop the module.
	 * @returns void
	 * @async
	 */
	public async stop() {

		// Clear the timeout and any queue items.
		clearInterval(this.timer);
		this.queue.clear();

		// Verify the module has a stop function.
		if (typeof this.module.onStop === 'function') {
			await this.module.onStop();
		}
	}

	/**
	 * Handle the IPC message.
	 * @param message The message to handle.
	 * @returns void
	 * @async
	 */
	public async handleIpc(message: IThreadMessage) {

		// If no process.send method, throw.
		if (!process.send) throw new Error('No IPC channel available.');

		// Check if direct command.
		if (message.command.startsWith('@')) {
			return await this.handleIpcCommand(message);
		}

		// Check if message is result.
		if (message.isResult) {

			// Check for dispatch response.
			const uid = message.uid;
			if (!uid) return;

			// Resolve the queue item.
			const item = this.queue.get(uid);
			if (!item || item.command !== message.command) return;

			// Resolve the promise.
			item.resolve(message.context);
			return;

		// Otherwise; assume it's a command for the thread.
		} else {

			// Check if the module has an onIpc method.
			if (typeof this.module.onIpc !== 'function') return;

			// Execute the onIpc method.
			const result = await this.module.onIpc(message);
			process.send({ uid: message.uid, command: message.command, context: result ?? {}, isResult: true });
		}
	}

	/**
	 * Will create a IPC callback for the thread, so that
	 * when the main process sends a message that meets the
	 * given UID, the promise will be resolved with the value.
	 *
	 * By default a timeout of 5 seconds is added, but that
	 * can be overridden by the set by the thread.
	 *
	 * @param uid A UID for the item.
	 * @param item ITreadQueueItem
	 */
	public createIpcCallback(uid: string, item: IThreadQueueItem) {
		const newItem = Object.assign(item, { createdAt: Date.now() });
		this.queue.set(uid, newItem);
	}

	/**
	 * Each second check our queue for any items that have
	 * timed out and if so, resolve the promise with null
	 * and delete them from the queue.
	 * @private
	 */
	private handleQueueTimeout() {
		const now = Date.now();
		for (const [uid, item] of this.queue) {
			if (now - item.createdAt > item.timeout) {
				if (!this.queue.has(uid)) continue;
				item.resolve(null);
				this.queue.delete(uid);
			}
		}
	}

	/**
	 * Will handle any direct IPC commands, like init, start
	 * and stop, these are control commands built in to each
	 * thread, and will be handled by the thread wrapper.
	 * @param message IThreadMessage
	 * @returns void
	 */
	private async handleIpcCommand(message: IThreadMessage) {
		if (!process.send) throw new Error('No IPC channel available.');
		if (message.command === '@init') {
			const context = message.context ?? {};
			if (context.registry) Registry.import(JSON.parse(context.registry));
			await this.init();
			process.send(Object.assign(message, { result: true }));
		} else if (message.command === '@start') {
			await this.start();
			process.send(Object.assign(message, { result: true }));
		} else if (message.command === '@stop') {
			setInterval(() => {}, 60_000);
			await this.stop();
			process.exit(0);
		}
	}
}
