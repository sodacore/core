import type { IWorkerControllerItem, IWorkerOptions, IWorkerQueueItem } from '../types';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import BaseModule from '../base/module';
import { PATH_WORKER_WRAPPER } from '../helper/constants';
import { v4 } from 'uuid';

/**
 * The workers module is responsible for managing all workers, it will
 * deal with spawning, pooling, and general management of the workers.
 * It will also dispatch and digest the messages to the correct worker.
 * @class Workers
 * @extends BaseModule
 * @default
 */
export default class Workers extends BaseModule {
	private controllers: Record<string, IWorkerControllerItem> = {};
	private checkTimer: Timer | null = null;

	public async init() {

		// Let's process all controllers.
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			const uid = Utils.getMeta<string>('uid', 'worker')(module.constructor);
			const filename = Utils.getMeta<string>('filename', 'worker')(module.constructor);
			const options = Utils.getMeta<IWorkerOptions>('options', 'worker')(module.constructor, undefined, {});

			// If a worker type.
			if (!types.includes('worker')) continue;

			// Create the controller definition.
			this.controllers[uid] = {
				uid,
				uidShort: uid.slice(0, 8),
				filename,
				options,
				instance: module,
				workers: [],
				queue: [],
			};
		}

		// Notify the count of controllers.
		this.logger.info(`[WORKERS]: Found ${Object.keys(this.controllers).length} worker(s).`);

		// Execute a process to notify the console for backed up queues.
		this.checkTimer = setInterval(() => {
			this.checkQueue();
		}, 6e4);
	}

	/**
	 * Start all workers.
	 * @returns void
	 * @async
	 */
	public async start() {
		this.logger.info(`[WORKERS]: Starting ${Object.keys(this.controllers).length} workers.`);

		// Loop the workers and let's create them.
		for (const uid in this.controllers) {
			const controller = this.controllers[uid];

			// Create the workers depending on the pool size.
			controller.workers = Array.from({ length: controller.options.poolSize ?? 1 }, () => {
				return {
					worker: this.createWorker(uid, controller.instance.name ?? controller.instance.constructor.name, controller.filename),
					active: false,
					ready: false,
					item: null,
				};
			});
		}
	}

	/**
	 * Stop all workers.
	 * @returns void
	 * @async
	 */
	public async stop() {
		this.logger.info(`[WORKERS]: Stopping ${Object.keys(this.controllers).length} workers.`);
		if (this.checkTimer) clearInterval(this.checkTimer);

		for (const uid in this.controllers) {
			for (const worker of this.controllers[uid].workers) {
				worker.worker.terminate();
			}
		}
	}

	/**
	 * Will return all of the controllers that are registered within
	 * the workers module, this is useful for introspection and debugging.
	 * @returns Record<string, IWorkerControllerItem>
	 */
	public getControllers() {
		return this.controllers;
	}

	/**
	 * Will return a controller by its UID, this is useful for introspection
	 * and debugging.
	 * @param uid The UID of the worker controller.
	 * @returns IWorkerControllerItem | undefined
	 */
	public getController(uid: string): IWorkerControllerItem | undefined {
		return this.controllers[uid];
	}

	/**
	 * Will return a new promise that will be queued, and will be processed
	 * by the worker when it is available. If you have used a timeout, then
	 * the worker may reject early if the timeout is reached before the worker
	 * has a chance to process the request.
	 * @param uid The UID of the worker.
	 * @param method The method to call within the worker.
	 * @param params The params to pass to the worker method.
	 * @returns Promise<any>
	 */
	public dispatch<T = any>(uid: string, method: string, params: unknown[] = [], timeout?: number) {

		// Get the controller and validate it exists.
		const controller = this.controllers[uid];
		if (!controller) throw new Error(`Worker with UID "${uid}" not found.`);

		// Return a new promise, which will dispatch to the worker and queue the promise.
		return new Promise<T>((resolve, reject) => {
			const actionId = v4();
			let timeoutRef: NodeJS.Timeout | null = null;

			// If there is a timeout, let's set that up.
			if (timeout) {
				timeoutRef = setTimeout(() => {

					// If the queue item is still in the queue.
					const queueItemIndex = controller.queue.findIndex(item => item.uid === actionId);
					if (!controller.queue[queueItemIndex]) {
						this.logger.error(`[WORKER]: No queue item found for ID "${actionId}" in worker "${controller.instance.name ?? controller.instance.constructor.name}". {${controller.uidShort}}`);
						return;
					}

					// Let's remove the queue item and then reject it.
					controller.queue.splice(queueItemIndex, 1);
					queueItem.reject(new Error(`Action "${actionId}" timed out after ${timeout}ms. {${controller.uidShort}}`));
				});
			}

			// Create the queue item.
			const queueItem: IWorkerQueueItem = {
				uid: actionId,
				resolve: (resolve as any),
				reject,
				createdAt: Date.now(),
				data: { method, params },
				timeout: timeoutRef,
			};

			// Insert the queue item into the controller's queue.
			controller.queue.push(queueItem);

			// Process the queue.
			this.processQueue(controller);
		});
	}

	/**
	 * Will create a worker for the given worker controller, this may
	 * spin up multiple workers depending on the pool size.
	 * @param uid The UID of the worker controller.
	 * @param name The name of the worker class.
	 * @param path The path to the worker file.
	 * @returns Worker
	 * @private
	 */
	private createWorker(uid: string, name: string, path: string) {
		const workerUrl = new URL(PATH_WORKER_WRAPPER, import.meta.url).href;
		const workerProcess = new Worker(workerUrl, {
			name,
			argv: [`--file=${path}`],
		});

		// On open we need to initialise the worker.
		workerProcess.addEventListener('open', () => {
			this.logger.info(`[WORKER]: Worker has been created. {${workerProcess.threadId}}`);

			workerProcess.postMessage({
				id: v4(),
				command: 'init',
			});
		});

		// On error, we can just log it.
		workerProcess.addEventListener('error', event => {
			this.logger.error(`[WORKER]: An error occurred in worker: "${name}", with reason: "${event.message}". {${workerProcess.threadId}}`);
		});

		// On close, we need to remove the worker and potentially restart it.
		workerProcess.addEventListener('close', () => {

			// Let's remove the worker from the array.
			const controller = this.controllers[uid];
			if (!controller) throw new Error(`Worker with UID "${uid}" not found.`);
			const index = controller.workers.findIndex(worker => worker.worker.threadId === workerProcess.threadId);
			if (index !== -1) {
				controller.workers.splice(index, 1);
			}

			// If the main process is exiting, we don't need to restart the worker.
			const isExiting = Registry.get<boolean>('shutdown');
			if (isExiting) {
				this.logger.info(`[WORKER]: "${name}" has exited gracefully. {${workerProcess.threadId}}`);
			} else {
				this.logger.warn(`[WORKER]: "${name}" has exited unexpectedly, restarting. {${workerProcess.threadId}}`);
				controller.workers.push({
					worker: this.createWorker(uid, name, path),
					active: false,
					ready: false,
					item: null,
				});
			}
		});

		// On message, we need to handle the message and resolve the queue item.
		workerProcess.addEventListener('message', event => {

			// Destructure the event data.
			const { id, data, command, error } = event.data;

			// Check for a valid controller.
			const controller = this.controllers[uid];
			if (!controller) throw new Error(`Worker with UID "${uid}" not found.`);

			// Check for a valid worker.
			const worker = controller.workers.find(w => w.worker.threadId === workerProcess.threadId);
			if (!worker) throw new Error(`Worker with UID "${uid}" not found in controller.`);

			// If the command is init, we need to set the worker as ready.
			if (command && command === 'init') {
				if (error) throw new Error(`"${name}" failed to initialise: ${error.message}. {${workerProcess.threadId}}`);
				worker.ready = true;
				return;
			}

			// Check for a valid queue item.
			if (!worker.item) throw new Error(`"${name}" has no active queue item. {${workerProcess.threadId}}`);
			if (worker.item.uid !== id) throw new Error(`Worker "${name}" received a message for an unknown queue item: ${id}. {${workerProcess.threadId}}`);

			// If there's an error, reject the queue item.
			if (error) {
				this.logger.error(`[WORKER]: "${name}" encountered an error: ${error.message}. {${workerProcess.threadId}}`);
				worker.item.reject(error);
			} else {
				worker.item.resolve(data);
			}

			// Delete the queue item.
			worker.item = null;
			worker.active = false;

			// Start the next item in the queue if it exists.
			this.processQueue(this.controllers[uid]);
		});

		return workerProcess;
	}

	/**
	 * Will look for a new queue item to process.
	 * @param controller The controller to process the queue for.
	 * @private
	 */
	private processQueue(controller: IWorkerControllerItem) {

		// Check for available workers.
		const getAvailableWorker = controller.workers.find(worker => !worker.active && worker.ready);
		if (!getAvailableWorker) return;

		// Set the worker as active and assign the item.
		getAvailableWorker.active = true;

		// Get the next item in the queue.
		const nextItem = controller.queue.shift();
		if (!nextItem) {
			getAvailableWorker.active = false;
			return;
		}

		// Set the worker as active and assign the item.
		getAvailableWorker.item = nextItem;

		// Now post the message.
		getAvailableWorker.worker.postMessage({
			id: nextItem.uid,
			method: nextItem.data.method,
			args: nextItem.data.params,
		});
	}

	/**
	 * This method will loop the controllers and check for any queue
	 * items that are backed up. If there are any, it will notify the
	 * console.
	 * @private
	 */
	private checkQueue() {
		for (const uid in this.controllers) {

			// Check if the controller has any queue items.
			const controller = this.controllers[uid];
			if (controller.queue.length === 0) continue;

			// Check for any tasks that have been waiting longer than 1 minute.
			const backedUpItems = controller.queue.filter(item => Date.now() - item.createdAt > 6e4);
			if (backedUpItems.length === 0) continue;

			// Define the variables.
			const controllerName = controller.instance.name ?? controller.instance.constructor.name;
			const workerCount = controller.workers.length;
			const queueSize = controller.queue.length;

			// Notify the console.
			this.logger.warn(`[WORKER]: "${controllerName}" has ${queueSize} queued task(s), with ${workerCount} worker(s) available. {${controller.uidShort}}`);
		}
	}
}
