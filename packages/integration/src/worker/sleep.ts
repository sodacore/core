import { BaseWorker, Expose, Utils, Worker } from '@sodacore/core';

@Worker(Utils.resolve(import.meta.filename), {
	poolSize: 1,
})
export default class SleepWorker extends BaseWorker {

	@Expose()
	public sleep(ms: number): Promise<boolean> {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
			}, ms);
		});
	}

	@Expose()
	public async count(taskName: string) {
		console.log(`Starting task: ${taskName} on thread ${this.getThreadId()}`);
		for (let i = 0; i < 1e10; i++) {
			// console.log(taskName, i, this.getThreadId());
		}
	}
}
