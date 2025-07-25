import type { ConfirmOptions, MultiSelectOptions, SelectOptions, TextOptions } from '@clack/prompts';
import type ScriptContext from './context/script';
import type ThreadContext from './context/thread';
import type Application from './module/application';
import type Logger from './provider/logger';

export type Constructor<K> = { new(): K };
export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | Promise<T>;

export type IHookType = 'preInit' | 'postInit' | 'preStart' | 'postStart' | 'preStop' | 'postStop' | string;
export type ILoggerType = 'info' | 'warn' | 'error';

export type IConfig = {
	name?: string,
	logger?: Logger,
	autowire?: boolean,
	basePath?: string,
	enableCli?: boolean,
	password?: string,
	hostname?: string,
	port?: number,
};

export type IConfigServiceQueue = {
	enabled: boolean,
	hostname?: string,
	port: number,
};

export type IAutowireModule = {
	name: string,
	type: string,
	order: number,
	module: any,
};

export interface IPlugin {
	name: string,
	version: string,
	description: string,
	author: string,
	dependencies: string[],
	install?: (app: Application) => Promise<void>,
	init?: () => Promise<any>,
	start?: () => Promise<any>,
	stop?: () => Promise<any>,
}

export type ITaskSettings = {
	name?: string, // Default: undefined.
	maxRuns?: number,	// Default: Infinite.
	timezone?: string,	// Default: 'UTC'.
	startAt?: Date, // Default: undefined.
	stopAt?: Date, // Default: undefined.
	interval?: number,	// Default: 0,
	protect?: boolean,	// Default: true.
};

export type IWorkerOptions = {
	uid?: string, // Default: <generated>
	poolSize?: number, // Default: 1
	// autoScale?: boolean, // Default: false
	// maxPoolSize?: number, // Default: <cpu cores / 2>
};

export type IWorkerControllerItem = {
	uid: string,
	uidShort: string,
	filename: string,
	options: IWorkerOptions,
	instance: any,
	queue: IWorkerQueueItem[],
	workers: {
		worker: Worker,
		active: boolean,
		ready: boolean,
		item: IWorkerQueueItem | null,
	}[],
};

export type IWorkerQueueItem = {
	uid: string,
	timeout: NodeJS.Timeout | null,
	createdAt: number,
	workerId?: number,
	data: { method: string, params: any[] },
	resolve: (value: unknown) => void,
	reject: (value: unknown) => void,
};

export type IWorkerMessage = {
	id: string,
	command?: string,
	method?: string,
	args?: any[],
};

export type IThreadMessage = {
	uid?: string,
	command: string,
	context?: Record<string, any>,
	isResult?: boolean,
};

export type IThreadQueueItem = {
	resolve: (value: unknown) => void,
	timeout: number,
	command: string,
	context?: Record<string, any>,
};

export type IThreadQueueItemWithMeta = IThreadQueueItem & {
	createdAt: number,
};

export interface IThreadController {
	[key: string | number | symbol]: (context: ThreadContext) => Promise<any>,
}

export type ITaskType = 'manual' | 'scheduled' | 'any';

export type ICommandsMeta = ICommandOptionsWithMeta[];

export type ICommandOptions = {
	name?: string,
	description?: string,
	hidden?: boolean,
};

export type ICommandOptionsWithMeta = ICommandOptions & {
	name: string,
	func: string | symbol,
};

export type ICommandParamOptions = {
	description?: string,
	default?: string,
	example?: string,
};

export type ICommandNamespaceOptions = {
	name?: string,
	description?: string,
	hidden?: boolean,
};

export type IPacket = {
	command: string,
	context?: Record<string, any>,
	result?: {
		status: boolean,
		message?: string,
		error?: Error,
		toMenu?: boolean,
	},
};

export type IResponse = {
	status: boolean,
	message?: string,
	error?: Error,
	context?: Record<string, any>,
};

export type IScriptSocketData = {
	uid: symbol,
	authenticated: boolean,
	results: Record<string, (value: any) => void>,
	session: Map<string, any>,
	userDefined: Record<string, any>,
	onExit: Array<() => void>,
};

export type IScriptMetaParamItem = {
	type: 'socket' | 'context',
	index: number,
	key?: string | boolean,
};

export type AsScript<T> = {
	// eslint-disable-next-line ts/no-unsafe-function-type
	[key in keyof T]: T[key] extends Function ? (context: ScriptContext) => any | Promise<any> : T[key]
};

export type IScriptPromptItem = {
	type: 'text' | 'confirm' | 'select' | 'multiselect',
	key: string,
	options: TextOptions | ConfirmOptions | SelectOptions<any> | MultiSelectOptions<any>,
};

export type ILogMessage = {
	type: ILoggerType,
	message: string,
	formatted: string,
};
