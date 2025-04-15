import type { IHookType } from '../types';
import { Inject, Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import BaseModule from '../base/module';
import Logger from '../provider/logger';

/**
 * This class is responsible for dispatching hook events to the
 * modules that have methods with the Hook decorator applied.
 * @class Events
 * @default
 * @static
 */
export default class Events extends BaseModule {
	@Inject() protected logger!: Logger;
	private modules: any[] = [];

	/**
	 * Initialise the events module, this will search for all modules
	 * that have methods with the Hook decorator applied and store them
	 * for later use.
	 * @static
	 */
	public async init() {
		const modules = Registry.all();
		for (const module of modules) {
			const properties = Utils.getMeta('methods', 'hook')(module);
			if (!properties) continue;
			this.modules.push(module);
		}
	}

	/**
	 * Dispatch the given hook event to all modules that have methods
	 * with the Hook decorator applied.
	 * @param type IHookType
	 * @returns void
	 * @async
	 */
	public async dispatch(type: IHookType, context?: Record<string, any>, fromPlugin?: string) {
		this.logger.info(`[EVENTS${fromPlugin ? `/${fromPlugin}` : ''}]: Dispatching hook event: "${type}".`);

		// Loop through the modules and search for any methods with hooks.
		for (const module of this.modules) {
			const methods = Utils.getMeta('methods', 'hook')(module);
			if (!methods) continue;

			// Loop through the methods with hooks.
			for (const methodName of methods) {

				// Get the hook type and validate.
				const hookType = Utils.getMeta('type', 'hook')(module, methodName);
				if (hookType !== type) continue;

				// Validate the method is a function.
				const method = module[methodName].bind(module);
				if (typeof method !== 'function') continue;

				// Execute the method.
				await method(context);
			}
		}
	}
}
