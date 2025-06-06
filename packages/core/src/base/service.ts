import { Inject } from '@sodacore/di';
import Logger from '../provider/logger';

/**
 * The BaseService class is used for all services to
 * extend from, creating empty functions to be
 * overridden, also includes the logger.
 * @class BaseService
 * @default
 */
export default class BaseService {
	@Inject() protected logger!: Logger;

	/**
	 * Initialise the service, this method is run once
	 * when the service is initialised.
	 * @returns Promise<void>
	 * @async
	 */
	public async init() {
		//
	}

	/**
	 * Start the service.
	 * @returns Promise<void>
	 * @async
	 */
	public async start() {
		//
	}

	/**
	 * Stop the service.
	 * @returns Promise<void>
	 * @async
	 */
	public async stop() {
		//
	}
}
