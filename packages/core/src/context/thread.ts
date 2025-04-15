import type { Subprocess } from 'bun';

/**
 * The ThreadContext is an object passed to all thread
 * controller methods when they are triggered that contains
 * information about the thread that called it.
 * @class ThreadContext
 * @default
 */
export default class ThreadContext {

	/**
	 * Initialise the thread context object, this will contain
	 * information about the thread that called the method.
	 * @param uid The UID of the request.
	 * @param command The command that was called.
	 * @param subprocess The subprocess that called the command.
	 * @param context The context of the command.
	 * @constructor
	 */
	public constructor(
		private uid: string,
		private command: string,
		private subprocess: Subprocess,
		private context?: Record<string, any>,
	) {}

	/**
	 * Get the UID of the request.
	 * @returns string
	 */
	public getUid() {
		return this.uid;
	}

	/**
	 * Get the command that was called.
	 * @returns string
	 */
	public getCommand() {
		return this.command;
	}

	/**
	 * Get the namespace of the command.
	 * @returns string
	 */
	public getNamespace() {
		return this.command.split(':')[0];
	}

	/**
	 * Get the method of the command.
	 * @returns string
	 */
	public getMethod() {
		return this.command.split(':')[1];
	}

	/**
	 * Get the context of the command.
	 * @returns T = Record<string, any>
	 * @generic T
	 */
	public getContext<T = Record<string, any>>() {
		return this.context as T;
	}

	/**
	 * Get a value from the context.
	 * @param key The key to retrieve.
	 * @returns T
	 * @generic T
	 */
	public getContextValue<T = any>(key: string) {
		if (!this.context) return null;
		return this.context[key] as T;
	}

	/**
	 * Get the subprocess that called the command.
	 * @returns Subprocess
	 */
	public getSubprocess() {
		return this.subprocess;
	}

	/**
	 * Get the PID of the subprocess.
	 * @returns number
	 */
	public getPid() {
		return this.subprocess.pid;
	}
}
