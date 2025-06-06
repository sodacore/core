import type { IWorkerOptions } from '../types';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { isMainThread } from 'bun';
import { v4 } from 'uuid';
import WorkersProvider from '../provider/workers';

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
 * @param options Optional options for the worker, such as UID.
 * @param options.uid The unique identifier for the worker, if not provided, a random one will be generated.
 * @param options.poolSize The size of the worker pool, if not provided, defaults to 1.
 * @returns ClassDecorator
 * @default
 */
export default function Worker(filename: string, options?: IWorkerOptions) {
	return (target: any) => {

		// If we're not in the main thread, stop.
		if (!isMainThread) return;

		// Check that the pool size actually has a number larger than 1.
		if (options && typeof options.poolSize !== 'undefined' && options.poolSize < 1) {
			throw new Error(`The pool size for the worker "${target.name}" must be at least 1.`);
		}

		// // If the auto scale option is enabled, then throw an error if pool size is defined.
		// if (options && options.autoScale && typeof options.poolSize !== 'undefined') {
		// 	throw new Error(`The auto scale option for the worker "${target.name}" cannot be used with a defined pool size. Instead you can use the maxPoolSize option to define the maximum size of the pool.`);
		// }

		// Define our UID.
		const uid = options?.uid ?? v4();

		// Define any base metadata.
		Utils.setMeta('type', 'autowire')(target, 'worker');
		Utils.setMeta('filename', 'worker')(target, filename);
		Utils.setMeta('uid', 'worker')(target, uid);
		Utils.setMeta('options', 'worker')(target, options ?? {});

		// Let's get the exposed methods.
		const exposedMethods = Utils.getMeta<string[]>('exposed', 'worker')(target, undefined, []);

		// Loop the methods and override them.
		exposedMethods.forEach(method => {
			target.prototype[method] = (...args: any[]) => {
				const workerProvider = Registry.get<WorkersProvider>(WorkersProvider.name);
				if (!workerProvider) throw new Error('The worker provider is not registered, please ensure all dependencies are of the correct version.');
				return workerProvider.dispatch(uid, method, args);
			};
		});
	};
}
