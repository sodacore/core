import type { IPlugin } from '../types';
import { Inject } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import Logger from '../provider/logger';

/**
 * The BasePlugin class is used to build your plugins from,
 * that comes with a basic set of properties out of the
 * box, with the ability to automatically register your
 * plugin to the Registry for you.
 * @class BasePlugin
 * @default
 */
export default class BasePlugin implements IPlugin {
	@Inject() protected logger!: Logger;
	public name = '@sodacore/example';
	public author = 'Sodacore Team <sodacoredev@gmail.com> (https://sodacore.dev)';
	public description = 'This is an example plugin that must be extended by plugin authors.';
	public version = '0.0.0';
	public dependencies: string[] = [];

	/**
	 * Initialise the plugin.
	 * @param config Should be typed by the extending plugin.
	 * @constructor
	 */
	public constructor(protected config?: Record<string, any>) {}

	/**
	 * Will register your plugin's config to the registry,
	 * this uses your plugins name, or for scoped @sodacore
	 * modules, this will remove the "sodacore" part.
	 * @protected
	 */
	protected setup() {
		const pluginName = this.name.replace('@sodacore/', '');
		Registry.set(`@${pluginName}:config`, this.config);
	}
}
