import type { IWorkerQueueItem } from '../types';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { isMainThread } from 'bun';
import { v4 } from 'uuid';
import { createWorker } from '../helper/worker';
import Logger from '../provider/logger';

/**
 * Apply this decorator to any classes that are considered workers,
 * where they will run a separate thread, allowing you to offload CPU
 * heavy processing, externally to the main thread and prevent I/O
 * blocking, please note the filename should be the file that holds the
 * class, and be aware of file changes.
 *
 * The difference between this and a thread is that a thread is an
 * entirely, for all intents and purposes, a different process, while
 * a worker acts more like part of your main application allowing you
 * to detatch small parts away from the main thread, internally uses
 * a proxy and queue system to send and receive messages.
 *
 * @param filename The filename of the file this class resides in.
 * @returns ClassDecorator
 * @default
 */
export default function Worker(filename: string) {
	return (target: any) => {

		// If we're not in the main thread, we can't do anything.
		if (!isMainThread) return;

		// Define any base metadata.
		Utils.setMeta('type', 'autowire')(target, 'worker');
		Utils.setMeta('filename', 'worker')(target, filename);

		// Let's get the exposed methods.
		const exposedMethods = Utils.getMeta<string[]>('exposed', 'worker')(target, undefined, []);

		// We need to create and start the worker, then register it.
		const instance = createWorker(target.name, filename);
		Registry.set(`@sodacore:workerInstance:${target.name}`, instance);

		// Also register the queue.
		const queue = new Map<string, IWorkerQueueItem>();
		Registry.set(`@sodacore:workerQueue:${target.name}`, queue);

		// Assign things to self.
		target.instance = instance;
		target.queue = queue;

		// Add an error listener.
		instance.addListener('error', event => {

			// Get the logger.
			const logger = Registry.get<Logger>('Logger');

			// Found an error, let's just post to console.
			logger.error(`[WORKER]: An error occurred in worker: "${target.name}", with reason: "${event.message}".`);

			// Loop keys and reject all waiting promises.
			const keys = queue.keys();
			for (const key of keys) {
				queue.get(key)?.reject(event);
				queue.delete(key);
			}

			// Throw an error.
			throw event;
		});

		// Add a message listener.
		instance.addListener('message', event => {

			// Get the message and the ID.
			const { id, data, error } = event.data;

			// Get the queue item and remove it.
			const queueItem = queue.get(id);
			queue.delete(id);

			// If there's an error, reject the queue item.
			if (error) {
				queueItem?.reject(error);
				return;
			}

			// Resolve the queue item.
			queueItem?.resolve(data);
		});

		// Add an on open listener and then call init.
		instance.addListener('open', () => {
			instance.postMessage({
				id: v4(),
				command: 'init',
			});
		});

		// Loop the methods and override them.
		exposedMethods.forEach(method => {
			target.prototype[method] = (...args: any[]) => {
				return new Promise((resolve, reject) => {

					// Create ID and assign resolve, reject to queue.
					const id = v4();
					queue.set(id, { resolve, reject });

					// Post message to worker.
					instance.postMessage({
						id,
						method,
						args,
					});
				});
			};
		});
	};
}
