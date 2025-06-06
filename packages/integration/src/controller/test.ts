import { Inject } from '@sodacore/di';
import { Controller, Get } from '@sodacore/http';
import SleepWorker from '../worker/sleep';

@Controller('/test')
export default class TestController {
	@Inject() private sleepWorker!: SleepWorker;
	private counter = 0;

	@Get('/:hello/:something?/:else?')
	public async run() {
		return new Response('Hello World!');
	}

	@Get('/sleep')
	public async sleep() {
		const tasks: any[] = [];
		const start = Date.now();
		for (let i = 0; i < 50; i++) {
			tasks.push(this.sleepWorker.count(`Task${this.counter}`));
			this.counter++;
		}
		Promise.all(tasks).then(() => {
			const end = Date.now();
			console.log(`Completed ${tasks.length} tasks completed in ${end - start}ms`);
		});
		return 'hi';
	}
}
