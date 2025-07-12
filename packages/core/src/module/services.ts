import type BaseService from '../base/service';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import BaseModule from '../base/module';

/**
 * The services module is responsible for running all services
 * that have the Service decorator applied, it will create a
 * cron job for each service and run them based on the schedule.
 * @class Services
 * @extends BaseModule
 * @default
 */
export default class Services extends BaseModule {
	private services: BaseService[] = [];

	/**
	 * Initialise the services module, this will search for all services
	 * that have the Service decorator applied and create a cron job
	 * for each service based on the schedule.
	 * @returns void
	 * @async
	 */
	public async init() {
		this.services = Registry.all().filter(module => {
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			if (!types.includes('service')) return false;
			return true;
		});

		// Init all services.
		this.logger.info(`[SERVICES]: Initializing ${this.services.length} services.`);
		await Promise.all(this.services.map(service => service.init()));
	}

	/**
	 * Will start all services.
	 * @returns void
	 * @async
	 */
	public async start() {
		this.logger.info(`[SERVICES]: Starting ${this.services.length} services.`);
		await Promise.all(this.services.map(service => service.start()));
	}

	/**
	 * Will stop all services.
	 * @returns void
	 * @async
	 */
	public async stop() {
		this.logger.info(`[SERVICES]: Stopping ${this.services.length} services.`);
		await Promise.all(this.services.map(service => service.stop()));
	}
}
