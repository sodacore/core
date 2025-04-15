import { PATH_WORKER_WRAPPER } from './constants';

/**
 * Will create a worker instance and return it, under the
 * hood this just bootstraps the Sodacore worker wrapper
 * that will eventually load the module and setup IPC.
 * @param name The worker name.
 * @param path The path to the worker.
 * @returns Worker
 */
export function createWorker(name: string, path: string) {

	// Define the worker URL.
	const workerUrl = new URL(PATH_WORKER_WRAPPER, import.meta.url).href;
	const workerProcess = new Worker(workerUrl, {
		name,
		argv: [`--file=${path}`],
	});

	return workerProcess;
}
