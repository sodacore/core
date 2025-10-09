import type { IConfig, IPlugin } from '../types';
import type Application from './application';
import process from 'node:process';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { Glob } from 'bun';
import BaseModule from '../base/module';

/**
 * The autowire module is responsible for scanning the application
 * for modules and plugins, it will then register and initialise
 * them based on the metadata provided.
 * @class Autowire
 * @extends BaseModule
 * @default
 */
export default class Autowire extends BaseModule {
	private modules: any[] = [];
	private plugins: IPlugin[] = [];

	/**
	 * Initialise the autowire module.
	 * @param config IConfig
	 * @param application instanceof Application
	 * @constructor
	 */
	public constructor(
		config: IConfig,
		private application: Application,
	) {
		super(config);
	}

	/**
	 * Will initialise the autowire module, which in the first step
	 * will scan the user's src folder (or custom path, if given), to
	 * find all possible modules, it then will call import, reorder and
	 * finally load.
	 * @returns void
	 * @async
	 */
	public async init() {
		this.logger.info('[AUTOWIRE]: Verifying plugins.');
		await this.verify();
		this.logger.info('[AUTOWIRE]: Initialising autowire, scanning for files.');
		const files = await this.scanFiles();
		this.logger.info(`[AUTOWIRE]: Found: ${files.length} files.`);
		await this.import(files);
		this.logger.info(`[AUTOWIRE]: Registered: ${this.modules.length} modules.`);
		await this.reorder();
		await this.load();
	}

	/**
	 * Will verify the plugins and their metadata, this will be
	 * check whether the right plugins are installed, before they
	 * will launch.
	 * @returns void
	 * @async
	 */
	public async verify() {
		const pluginNames = this.plugins.map(plugin => plugin.name);
		this.plugins.forEach(plugin => {
			if (plugin.dependencies.length > 0) {
				if (plugin.dependencies.some(dep => !pluginNames.includes(dep))) {
					const missingDependencies = plugin.dependencies.filter(dep => !pluginNames.includes(dep));
					this.logger.error(`[PLUGIN]: Missing dependencies for plugin: "${plugin.name}@${plugin.version}".`);
					this.logger.error(`[PLUGIN]: ${missingDependencies.length} dependenc${missingDependencies.length === 1 ? 'y' : 'ies'} required: ${missingDependencies.join(', ')}.`);
					process.exit(1);
				}
			}
		});
	}

	/**
	 * Will install the given plugin, by calling the plugin's
	 * internal install method, while accessing it's metadata.
	 * @param plugin IPlugin
	 * @returns void
	 * @async
	 */
	public async install(plugin: IPlugin) {

		// Notify the console.
		this.logger.info(`[PLUGIN]: Installing plugin: ${plugin.name}@${plugin.version}.`);

		// Install the plugin.
		if (plugin.install) plugin.install(this.application);
		this.plugins.push(plugin);
	}

	/**
	 * This will register the given module to the autowire module,
	 * so that on register we shall initialise it.
	 * @param module Class module (not instance).
	 * @returns void
	 * @async
	 */
	public async register(module: any) {
		this.modules.push(module);
	}

	/**
	 * Will scan the files in the user's src folder, and return
	 * a string array of the found files, searches for `.ts` and
	 * `.js` files only and the base path can be configured with
	 * the `basePath` property in the config.
	 * @returns void
	 * @async
	 * @private
	 */
	private async scanFiles() {

		// Define the files, and create a new glob instance.
		let files: string[] = [];
		const glob = new Glob('**/*.{ts,js}');

		// Scan and add the files.
		for await (const file of glob.scan({
			cwd: this.config.basePath ?? `${process.cwd()}/src`,
			onlyFiles: true,
			absolute: true,
		})) {
			files.push(file);
		}

		// Filter out the executing file, this prevents recursion when compiled.
		const executingFile = String(process.argv[1]);
		const filePathWithoutExtension = executingFile.split('.').slice(0, -1).join('.');
		const blacklistedFiles = [`${filePathWithoutExtension}.ts`, `${filePathWithoutExtension}.js`];
		blacklistedFiles.forEach(path => {
			files = files.filter(file => file !== path);
		});

		// Return scanned files.
		return files;
	}

	/**
	 * Will import the given files, and then loop through the
	 * modules and register them based on their metadata.
	 * @param files string[]
	 * @returns void
	 * @async
	 * @private
	 */
	private async import(files: string[]) {

		// Loop found files and determine module status.
		for await (const file of files) {

			// Import the module and get the keys.
			const module = await import(file);
			const keys = Object.keys(module);

			// Loop available keys.
			for (const key of keys) {

				// Continue if not typeof function.
				if (typeof module[key] !== 'function') continue;

				// Check if the key from the class is a module.
				const types = Utils.getMeta<string[]>('type', 'autowire')(module[key], undefined, []);
				if (types.length === 0) continue;

				// Add to our modules.
				this.modules.push(module[key]);
			}
		}
	}

	/**
	 * Will reorder the modules based on the order metadata.
	 * @returns void
	 * @async
	 * @private
	 */
	private async reorder() {
		this.modules = this.modules.sort((a, b) => {
			const orderA = Utils.getMeta('order', 'autowire')(a, undefined, 50);
			const orderB = Utils.getMeta('order', 'autowire')(b, undefined, 50);
			return orderA - orderB;
		});
	}

	/**
	 * Will loop the modules and initialise them, adding them
	 * to the registry, and calling the onInit method if it exists.
	 * @returns void
	 * @async
	 * @private
	 */
	private async load() {
		for await (const Module of this.modules) {

			// Get metadata.
			const name = Utils.getMeta('name', 'di')(Module);
			const types = Utils.getMeta<string[]>('type', 'autowire')(Module, undefined, ['core']);
			this.logger.info(`[AUTOWIRE]: Registering ${types.join(', ')}: "${name ?? Module.name}".`);

			// Initialise the module and add to the registry.
			const instance = new Module(this.config);
			Registry.set(name ?? Module.name, instance);

			// Look for onInit method.
			if (typeof instance.onInit === 'function') {
				await instance.onInit();
			}
		}
	}
}
