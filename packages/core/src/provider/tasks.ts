import type { ITaskType } from '../types';
import { Inject, Provide } from '@sodacore/di';
import { Cron } from 'croner';
import Runner from '../module/runner';

/**
 * This provider offers functionality for manually
 * executing tasks, this can be scheduled tasks or
 * manually ran tasks.
 * @class TasksProvider
 * @provide
 * @default
 */
@Provide()
export default class TasksProvider {
	@Inject() protected runner!: Runner;

	/**
	 * Will return all available tasks, this can be
	 * specified between scheduled (tasks that have
	 * a cron schedule) or manual (tasks that are ran
	 * manually) or all [default].
	 * @returns string[]
	 */
	public getTasks(type: ITaskType = 'any') {
		if (type === 'scheduled') {
			return this.runner.tasks.map(task => task.name);
		} else if (type === 'manual') {
			return this.runner.manualTasks.map(task => task.constructor.name);
		} else {
			return this.runner.tasks
				.map(task => task.name)
				.concat(this.runner.manualTasks
					.map(task => task.constructor.name),
				);
		}
	}

	/**
	 * Will return a task by name, this can be a scheduled
	 * task or a manual task, please verify to check the
	 * type of task before executing, or call the run method.
	 * @param name The name of the task.
	 * @returns Cron | BaseTask | null
	 */
	public getTaskByName(name: string) {
		const scheduledTasks = this.runner.tasks.find(task => task.name === name);
		const manualTasks = this.runner.manualTasks.find(task => task.constructor.name === name);
		return scheduledTasks ?? manualTasks ?? null;
	}

	/**
	 * Will await and run a given task, by name.
	 * @param name The name of the task.
	 * @returns void
	 * @async
	 */
	public async run(name: string) {

		// Get the task.
		const task = this.getTaskByName(name);
		if (!task) throw new Error(`Task "${name}" not found.`);

		// Execute the task.
		if (task instanceof Cron) {
			await task.trigger();
		} else {
			await task.run();
		}
	}
}
