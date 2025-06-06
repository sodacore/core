import type { IConfig } from '../types';
import { Inject, Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import Logger from '../provider/logger';

/**
 * The BaseModule class is used for all internal core
 * packages to extend from, it implements basic logging
 * and automatic referencing to define the module within
 * the Registry.
 * @class BaseModule
 * @default
 */
export default class BaseModule {
	@Inject() protected logger!: Logger;

	/**
	 * Initialise the module.
	 * @param config IConfig
	 * @constructor
	 */
	public constructor(
		protected config: IConfig,
	) {
		const type = Utils.getMeta('type', 'autowire')(this.constructor, undefined, 'core');
		const name = Utils.getMeta('name', 'autowire')(this.constructor, undefined, this.constructor.name);
		Registry.set(`@module:${type}:${name}`, this);
	}

	/**
	 * Initialise the module.
	 * @returns Promise<void>
	 * @async
	 */
	public async init() {
		//
	}

	/**
	 * Start the module.
	 * @returns Promise<void>
	 * @async
	 */
	public async start() {
		//
	}

	/**
	 * Stop the module.
	 * @returns Promise<void>
	 * @async
	 */
	public async stop() {
		//
	}
}
