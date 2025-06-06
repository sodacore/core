import type { ILoggerType, ILogMessage } from '../types';
import chalk from 'chalk';

/**
 * This class is a simple wrapper around the console.log
 * methods, it provides a consistent logging format and
 * colouring for different log types.
 * @class Logger
 * @default
 * @extendable
 */
export default class Logger {
	private listeners = new Map<symbol, (item: ILogMessage) => void>();

	/**
	 * Add a listener to the logger.
	 * @param unique The unique symbol to identify the listener.
	 * @param callback The callback function to call when a message is logged.
	 * @async
	 */
	public addListener(unique: symbol, callback: (item: ILogMessage) => void) {
		this.listeners.set(unique, callback);
	}

	/**
	 * Remove a listener from the logger.
	 * @param unique The unique symbol to identify the listener.
	 * @async
	 */
	public removeListener(unique: symbol) {
		this.listeners.delete(unique);
	}

	/**
	 * Get the number of listeners.
	 * @returns The number of listeners.
	 */
	public getListenerCount() {
		return this.listeners.size;
	}

	/**
	 * Log an info message.
	 * @param message The message to log.
	 * @returns void
	 * @async
	 */
	public async info(message: string) {
		const formatted = this.format('info', message);
		console.info(formatted);
		this.listeners.forEach(listener => listener({ formatted, message, type: 'info' }));
	}

	/**
	 * Log a warning message.
	 * @param message The message to log.
	 * @returns void
	 * @async
	 */
	public async warn(message: string) {
		const formatted = this.format('warn', message);
		console.warn(formatted);
		this.listeners.forEach(listener => listener({ formatted, message, type: 'warn' }));
	}

	/**
	 * Log an error message.
	 * @param message The message to log.
	 * @returns void
	 * @async
	 */
	public async error(message: string) {
		const formatted = this.format('error', message);
		console.error(formatted);
		this.listeners.forEach(listener => listener({ formatted, message, type: 'error' }));
	}

	/**
	 * Log a debug message.
	 * @param type The log type.
	 * @param message The message to log.
	 * @returns void
	 * @async
	 */
	private format(type: ILoggerType, message: string) {
		const now = new Date().toISOString();
		return [
			chalk.hex('#7B7B7B')(`[${now}]:`),
			this.getColour(type)(`${type.toUpperCase()}`),
			this.getNamespace(message),
			`${this.matchTags(message.substring(message.indexOf(':') + 2))}`,
		].join(' ');
	}

	/**
	 * Will regex the message to find the namespace
	 * and format/return it.
	 * @param message The message string.
	 * @returns The namespace string.
	 */
	private getNamespace(message: string) {
		const match = message.match(/\[(.*?)\]/);
		if (match) return chalk.hex('#FF8C00')(`${match[1]}`);
	}

	/**
	 * Will return the colour formatting for the
	 * given log type.
	 * @param type The log type.
	 * @returns The colour function.
	 */
	private getColour(type: string) {
		if (type === 'warn') return chalk.bold.yellow;
		if (type === 'error') return chalk.bold.red;
		return chalk.bold.blue;
	}

	/**
	 * Will match and colour any tags in the message,
	 * and then format and colour them.
	 * @param message The log message.
	 * @returns string
	 */
	private matchTags(message: string) {
		const matcher = /[^{}]+(?=})/g;
		const matches = message.match(matcher);
		if (!matches) return message;
		return matches.reduce((acc, match) => {
			return acc.replace(`{${match}}`, chalk.underline.hex('#3ed128')(`#${match}`));
		}, message);
	}
}
