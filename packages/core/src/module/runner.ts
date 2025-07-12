import type BaseTask from '../base/task';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { Cron, type CronOptions } from 'croner';
import BaseModule from '../base/module';

/**
 * The runner module is responsible for running all tasks
 * that have the Task decorator applied, it will create a
 * cron job for each task and run them based on the schedule.
 * @class Runner
 * @extends BaseModule
 * @default
 */
export default class Runner extends BaseModule {
	public manualTasks: BaseTask[] = [];
	public tasks: Cron[] = [];

	/**
	 * Initialise the runner module, this will search for all tasks
	 * that have the Task decorator applied and create a cron job
	 * for each task based on the schedule.
	 * @returns void
	 * @async
	 */
	public async init() {
		const tasks: BaseTask[] = Registry.all().filter(module => {
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			if (!types.includes('task')) return false;
			return true;
		});

		// Init all services.
		this.logger.info(`[RUNNER]: Initializing ${tasks.length} tasks.`);
		await Promise.all(tasks.map(task => {
			if (typeof task.init === 'function') {
				return task.init();
			}
			return Promise.resolve();
		}));

		// Loop each task, create a job.
		for (const task of tasks) {

			// Define the schedule and user options.
			const schedule = Utils.getMeta('schedule', 'task')(task.constructor);
			const userOptions = Utils.getMeta('settings', 'task')(task.constructor);

			// Skip it the schedule is 'manual'.
			if (schedule === 'manual') {
				this.manualTasks.push(task);
				continue;
			}

			// Define the options and merge.
			const options: CronOptions = Object.assign(<CronOptions>{
				name: task.constructor.name,
				maxRuns: Infinity,
				timezone: 'UTC',
				protect: true,
				paused: true,
			}, userOptions);

			// Create the cron job.
			this.tasks.push(
				new Cron(schedule, options, () => {
					task.run();
				}),
			);
		}
	}

	/**
	 * Start all tasks.
	 * @returns void
	 * @async
	 */
	public async start() {
		this.logger.info(`[TASKS]: Starting ${this.tasks.length} tasks.`);
		this.tasks.forEach(task => task.resume());
	}

	/**
	 * Stop all tasks.
	 * @returns void
	 * @async
	 */
	public async stop() {
		this.logger.info(`[TASKS]: Stopping ${this.tasks.length} tasks.`);
		this.tasks.forEach(task => task.stop());
	}
}
