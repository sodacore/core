import type {
	AsScript,
	Constructor,
	IAutowireModule,
	ICommandNamespaceOptions,
	ICommandOptions,
	ICommandOptionsWithMeta,
	ICommandParamOptions,
	ICommandsMeta,
	IConfig,
	IConfigServiceQueue,
	IHookType,
	ILoggerType,
	IPacket,
	IPlugin,
	IResponse,
	ITaskSettings,
	ITaskType,
	IWorkerMessage,
	IWorkerQueueItem,
	MaybeArray,
	MaybePromise,
} from './types';
import BaseModule from './base/module';
import BasePlugin from './base/plugin';

import BaseService from './base/service';
import BaseTask from './base/task';
import BaseWorker from './base/worker';
import ScriptContext from './context/script';
import Autoload from './decorator/autoload';
import Catch from './decorator/catch';
import Command from './decorator/command';
import Expose from './decorator/expose';
import Hook from './decorator/hook';
import Namespace from './decorator/namespace';
import Script from './decorator/script';
import Service from './decorator/service';
import Task from './decorator/task';
import Worker from './decorator/worker';
import * as Constants from './helper/constants';
import * as Utils from './helper/utils';

import * as WorkerUtils from './helper/worker';
import Application from './module/application';
import Autowire from './module/autowire';

import Events from './module/events';
import Runner from './module/runner';
import Services from './module/services';
import WorkerWrapper from './module/worker';
import Logger from './provider/logger';
import TasksProvider from './provider/tasks';
import WorkersProvider from './provider/workers';

export type {
	AsScript,
	Constructor,
	IAutowireModule,
	ICommandNamespaceOptions,
	ICommandOptions,
	ICommandOptionsWithMeta,
	ICommandParamOptions,
	ICommandsMeta,
	IConfig,
	IConfigServiceQueue,
	IHookType,
	ILoggerType,
	IPacket,
	IPlugin,
	IResponse,
	ITaskSettings,
	ITaskType,
	IWorkerMessage,
	IWorkerQueueItem,
	MaybeArray,
	MaybePromise,
};

export {
	Application,
	Autoload,
	Autowire,
	BaseModule,
	BasePlugin,
	BaseService,
	BaseTask,
	BaseWorker,
	Catch,
	Command,
	Constants,
	Events,
	Expose,
	Hook,
	Logger,
	Namespace,
	Runner,
	Script,
	ScriptContext,
	Service,
	Services,
	Task,
	TasksProvider,
	Utils,
	Worker,
	WorkersProvider,
	WorkerUtils,
	WorkerWrapper,
};
