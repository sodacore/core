import { Inject } from '@sodacore/di';
import Logger from '../provider/logger';

/**
 * The BaseTask class is used for all tasks to
 * extend from, creating empty functions to be
 * overridden, also includes the logger.
 * @class BaseTask
 * @default
 */
export default class BaseTask {
	@Inject() protected logger!: Logger;

	/**
	 * Initialise the task, this method is run once
	 * when the task is initialised.
	 * @returns Promise<void>
	 * @async
	 */
	public async init() {
		//
	}

	/**
	 * This method is called for each time
	 * the task is ran, based on the schedule.
	 * @returns Promise<void>
	 * @async
	 */
	public async run() {
		//
	}
}
