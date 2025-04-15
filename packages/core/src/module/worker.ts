import type { IWorkerMessage } from '../types';

declare const self: Worker;

/**
 * This class is a wrapper for the worker, it will handle the
 * IPC and execute the methods on the module that is imported.
 * @class WorkerWrapper
 * @usedby Worker
 * @default
 */
export default class WorkerWrapper {
	private module: any;

	/**
	 * Create a new instance of the WorkerWrapper class.
	 * @param filename The filename of the file this class resides in.
	 * @constructor
	 */
	public constructor(
		protected filename: string,
	) {
		self.on('message', event => {
			this.handleIpc.bind(this)(event.data);
		});
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
		this.module = new module[key]();

		// Verify the module has an init function.
		if (typeof this.module.init === 'function') await this.module.init();
	}

	/**
	 * Handle the IPC message.
	 * @param message The message to handle.
	 * @returns void
	 * @async
	 */
	public async handleIpc(message: IWorkerMessage) {

		// Check if is command.
		if (message.command && message.command === 'init') return await this.init();
		if (message.command) return;

		// Define the params.
		const methodName = message.method ?? '';
		const methodArgs = message.args ?? [];

		// Check for valid method.
		if (typeof this.module[methodName] !== 'function') {
			return self.postMessage({ id: message.id, error: new Error(`Method not found: ${methodName}`) });
		}

		// Wrap in a try; catch.
		try {

			// Execute the result and post back.
			const result = await this.module[methodName].bind(this.module)(...methodArgs);
			self.postMessage({ id: message.id, data: result });

		} catch (err) {

			// Post the error.
			self.postMessage({ id: message.id, error: err });
		}
	}
}
