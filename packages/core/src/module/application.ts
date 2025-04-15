import type { IConfig, IPlugin } from '../types';
import process from 'node:process';
import { Registry } from '@sodacore/registry';
import Logger from '../provider/logger';
import TasksProvider from '../provider/tasks';
import ThreadsProvider from '../provider/threads';
import Autowire from './autowire';
import Events from './events';
import Runner from './runner';
import Services from './services';
import Threads from './threads';
import Scripts from './scripts';
import DefaultScripts from '../script/default';
import CoreScripts from '../script/core';

/**
 * The main application class, this is the entry point for your application
 * and is responsible for initialising and starting all of the core modules
 * and plugins, it also provides a way to register and use plugins.
 * @class Application
 * @default
 */
export default class Application {
	protected autowire: Autowire;
	protected events: Events;
	protected runner: Runner;
	protected threads: Threads;
	protected services: Services;
	protected scripts: Scripts;
	protected logger: Logger;
	protected plugins: IPlugin[] = [];

	/**
	 * Create a new instance of the application.
	 * @param config The configuration object for the application.
	 * @constructor
	 */
	public constructor(
		protected config: IConfig,
	) {
		// Setup the logger.
		const logger = this.config.logger ?? new Logger();
		this.logger = logger;

		// Register the logger early.
		Registry.set('Logger', this.logger);
		if (this.logger.constructor.name !== 'Logger') {
			Registry.set(this.logger.constructor.name, this.logger);
		}

		// Register ourselves.
		Registry.set('config', this.config);
		Registry.set(this.constructor.name, this);

		// Register globals.
		Registry.set('DefaultScripts', new DefaultScripts());
		Registry.set('CoreScripts', new CoreScripts());

		// Initialise the modules.
		this.autowire = new Autowire(this.config, this);
		this.events = new Events(this.config);
		this.runner = new Runner(this.config);
		this.threads = new Threads(this.config);
		this.scripts = new Scripts(this.config);
		this.services = new Services(this.config);

		// Register them.
		Registry.set('Autowire', this.autowire);
		Registry.set('Events', this.events);
		Registry.set('Runner', this.runner);
		Registry.set('Scripts', this.scripts);
		Registry.set('Services', this.services);
		Registry.set('Threads', this.threads);

		// Create exit handler.
		process.on('SIGINT', () => this.handleStop.bind(this)());
		process.on('beforeExit', () => this.handleStop.bind(this)());
	}

	/**
	 * Start the application, this will start all of the core modules
	 * and plugins, this is the entry point for your application.
	 * @returns void
	 * @async
	 */
	public async start() {

		// Let's initialise first.
		await this.init();

		// Trigger the pre-start stage.
		await this.events.dispatch('preStart');

		// Start our core modules.
		await this.autowire.start();
		await this.runner.start();
		await this.threads.start();
		await this.services.start();
		await this.scripts.start();

		// Initialise the built in providers.
		Registry.set('ThreadsProvider', new ThreadsProvider());
		Registry.set('TasksProvider', new TasksProvider());

		// Trigger the post-start stage.
		await this.events.dispatch('postStart');

		// Notify the console of a successful start.
		this.logger.info('[APP]: Application has successfully started.');
	}

	/**
	 * Stop the application, this will stop all of the core modules
	 * and plugins, this is the exit point for your application.
	 * @returns void
	 * @async
	 */
	public async stop() {

		// Notify the console we are stopping.
		this.logger.info('[APP]: Stopping application.');

		// Trigger the pre-stop stage.
		await this.events.dispatch('preStop');

		// Stop all of our core modules.
		await this.services.stop();
		await this.threads.stop();
		await this.runner.stop();
		await this.autowire.stop();
		await this.scripts.stop();

		// Trigger the post-stop stage.
		await this.events.dispatch('postStop');

		// Notify the console of a successful shutdown.
		this.logger.info('[APP]: Application has successfully shutdown, thank you.');
	}

	/**
	 * Call this method with the plugin instance you wish to use,
	 * this will internally install the plugin and register all
	 * of the modules within.
	 * @param plugin The plugin you wish to use.
	 * @returns void
	 * @async
	 */
	public async use(plugin: IPlugin) {
		this.plugins.push(plugin);
		await this.autowire.install(plugin);
	}

	/**
	 * Will register a given class (not an instance), to the
	 * application. This method is a proxy to the autowire's
	 * register method.
	 * @param module The module to register.
	 * @returns void
	 * @async
	 */
	public async register(module: any) {
		return await this.autowire.register(module);
	}

	/**
	 * Initialise the application, this will initialise all of the core modules,
	 * this by default is called by the start method.
	 * @returns void
	 * @async
	 * @private
	 */
	private async init() {

		// Notify the console.
		this.logger.info('[APP]: Initialising application.');

		// Initialise the autowire first.
		await this.autowire.init();

		// Initialise our events system.
		await this.events.init();

		// Dispatch the pre-init stage.
		await this.events.dispatch('preInit');

		// Loop and initialise all plugins.
		await Promise.all(this.plugins.filter(plugin => !!plugin.init).map(plugin => plugin.init!()));

		// Initialise our main modules.
		await this.runner.init();
		await this.threads.init();
		await this.services.init();
		await this.scripts.init();

		// Dispatch the post-init stage.
		await this.events.dispatch('postInit');

		// Notify console of starting.
		this.logger.info('[APP]: Starting application.');
	}

	/**
	 * Handle the stop event, this is used to gracefully shutdown
	 * the application, by creating a interval on the runtime stack
	 * preventing the process from exiting until we call exit manually.
	 * @private
	 * @async
	 */
	private async handleStop() {
		setInterval(() => {}, 60_000);
		await this.stop();
		process.exit(0);
	}
}
