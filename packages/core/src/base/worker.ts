import { threadId } from 'node:worker_threads';

export default class BaseWorker {

	public getThreadId() {
		return threadId;
	}
}
