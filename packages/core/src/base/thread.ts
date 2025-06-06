import type ThreadWrapper from '../module/thread';
import type { ILoggerType, IThreadMessage } from '../types';
import process from 'node:process';
import { Utils } from '@sodacore/di';
import { v4 } from 'uuid';
import { isJson } from '../helper/utils';

/**
 * The BaseThread class is used for all threads to
 * extend from, handles the loading of the user config
 * that is passed in via the @Configure decorator, also
 * includes the logger.
 * @class BaseThread
 * @default
 */
export default class BaseThread {
	private userConfig: Record<string, any> = {};
	protected module: any;
	protected methods: Record<string, (message: IThreadMessage) => Promise<void>> = {};

	/**
	 * Initialise the thread, will trigger
	 * the config to load.
	 * @returns Promise<void>
	 */
	public constructor(private wrapper: ThreadWrapper) {
		this.loadConfig();
	}

	/**
	 * Load the user config from the
	 * @Configure decorator.
	 * @private
	 */
	private loadConfig() {
		this.userConfig = Utils.getMeta('user', 'config')(this.constructor, undefined, {});
	}

	/**
	 * Get the user config, or a specific
	 * key from the user config.
	 * @param key string
	 * @returns any
	 * @protected
	 * @generic T
	 */
	protected getConfig<T = unknown>(key?: string) {
		return key ? this.userConfig[key] as T : this.userConfig as T;
	}

	/**
	 * Will log a message back to the parent process.
	 * @param type The log type.
	 * @param message The message to log.
	 */
	public log(type: ILoggerType, message: string) {
		if (!process.send) return;
		const formatted = `[THREAD]: ${message} {${process.pid}} {${String(this.wrapper.module.constructor.name)}}`;
		process.send({ command: 'log', context: { type, message: formatted } });
	}

	/**
	 * Shorthand method for logging an info message.
	 * @param message The message to log.
	 */
	public info(message: string) {
		this.log('info', message);
	}

	/**
	 * Shorthand method for logging a warning message.
	 * @param message The message to log.
	 */
	public warn(message: string) {
		this.log('warn', message);
	}

	/**
	 * Shorthand method for logging an error message.
	 * @param message The message to log.
	 */
	public error(message: string) {
		this.log('warn', message);
	}

	/**
	 * Will either return all thread creation arguments, or
	 * a specific argument if provided.
	 * @param arg The arguments string.
	 */
	public getArgv<T = Record<string, any>>(arg?: string) {
		const [executable, script, threadPath, ...args] = process.argv;
		const parsed: Record<string, string> = {};
		parsed.executable = executable;
		parsed.script = script;
		parsed.threadPath = threadPath.split('=')[1];
		args.forEach(arg => {
			const [key, value] = arg.split('=');
			parsed[key.replace('--', '')] = isJson(value) ? JSON.parse(value) : value;
		});
		return arg ? parsed[arg] as T : parsed as T;
	}

	/**
	 * This will dispatch a message back to the parent process,
	 * this message will be handled by the parent process, and
	 * use a thread controller, the parent thread will then
	 * return a response once generated, please note a timeout
	 * has been added to prevent hanging and defaults to 5 seconds.
	 *
	 * A thread controller command is a two part string, split
	 * by a colon, the first part is the controller namespace,
	 * and the second part is the method to call on the controller.
	 *
	 * Thread controllers don't have any param decorators, because
	 * their data can be very different, instead a context object
	 * is passed as the first parameter, this will allow you to
	 * handle the given context data and send data back to the
	 * thread.
	 *
	 * @param command The controller namespace to dispatch to.
	 * @param context The context is any data you want to send.
	 * @param timeout Optional timeout, defaults to 5000ms.
	 * @returns Promise<unknown>
	 */
	public async dispatch<T = any>(command: string, context?: Record<string, any>, timeout = 5000) {
		return new Promise<T>((resolve, reject) => {
			if (!process.send) return reject();

			// Generate a unique id for the message.
			const uid = v4();

			// Dispatch the message.
			process.send({ command, uid, context });

			// Create a listener for the response.
			this.wrapper.createIpcCallback(uid, { command, context, timeout, resolve: resolve as any });
		});
	}
}
