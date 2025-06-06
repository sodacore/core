import { Inject, Provide } from '@sodacore/di';
import { v4 } from 'uuid';
import Threads from '../module/threads';

@Provide()
export default class ThreadsProvider {
	@Inject() protected threads!: Threads;

	public async dispatch(name: string, command: string, context?: Record<string, any>, timeout?: number) {
		return new Promise(resolve => {

			// Check for a thread.
			const subprocess = this.threads.getThread(name);
			if (!subprocess) resolve(false);

			// Generate an ID.
			const uid = v4();
			this.threads.addToQueue(uid, resolve, timeout);

			// Send the message.
			subprocess?.send({ uid, command, context });
		});
	}
}
