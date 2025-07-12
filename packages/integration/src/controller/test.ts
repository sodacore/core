import { Inject } from '@sodacore/di';
import { Controller, Get, Middlewares, Options, Use } from '@sodacore/http';
import SleepWorker from '../worker/sleep';

@Controller('/test')
export default class TestController {
	@Inject() private sleepWorker!: SleepWorker;
	private counter = 0;

	@Get('/say')
	public async say() {
		return 'Hello World!';
	}

	// @Get('/:hello/:something?/:else?')
	// public async run() {
	// 	return new Response('Hello World!');
	// }

	@Get('/sleep')
	@Use(Middlewares.Cors)
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

	// @Get('/cors-test')
	// public async corsTest() {
	// 	return 'Hello';
	// 	// return new Response('CORS Test', {
	// 	// 	headers: {
	// 	// 		'Access-Control-Allow-Origin': '*',
	// 	// 	},
	// 	// });
	// }

	@Options('*')
	public async options() {
		return new Response('', {
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	}

	/**
	 * Should support:
	 * /pathing/123/something
	 * /pathing/hello/something
	 *
	 * Should fail:
	 * /pathing/else
	 * /pathing/123/something/else
	 */
	@Get('/pathing/sausage.*/something')
	public async pathing1() {
		return 'Pathing 1 works!';
	}

	@Get('/pathing/wowser.*/something')
	public async pathing2() {
		return 'Pathing 2 works!';
	}
}
