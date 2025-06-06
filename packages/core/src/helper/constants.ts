import { resolve } from './utils';

export const PATH_THREAD_WRAPPER = resolve(import.meta.filename, '../../bootstrap/thread.js');
export const PATH_WORKER_WRAPPER = resolve(import.meta.filename, '../../bootstrap/worker.js');
