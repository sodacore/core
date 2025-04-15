import type {
	AsScript,
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
	IThreadController,
	IThreadMessage,
	IThreadQueueItem,
	IThreadQueueItemWithMeta,
	IWorkerMessage,
	IWorkerQueueItem,
} from './types';
import BaseModule from './base/module';
import BasePlugin from './base/plugin';

import BaseService from './base/service';
import BaseTask from './base/task';
import BaseThread from './base/thread';
import ScriptContext from './context/script';
import ThreadContext from './context/thread';
import Autoload from './decorator/autoload';
import Command from './decorator/command';
import Configure from './decorator/configure';
import Controller from './decorator/controller';
import Expose from './decorator/expose';
import Hook from './decorator/hook';
import Namespace from './decorator/namespace';
import Script from './decorator/script';
import Service from './decorator/service';
import Task from './decorator/task';
import Thread from './decorator/thread';
import Worker from './decorator/worker';
import * as Constants from './helper/constants';
import * as Utils from './helper/utils';

import * as WorkerUtils from './helper/worker';
import Application from './module/application';
import Autowire from './module/autowire';

import Events from './module/events';
import Runner from './module/runner';
import Services from './module/services';
import ThreadWrapper from './module/thread';
import Threads from './module/threads';
import WorkerWrapper from './module/worker';
import Logger from './provider/logger';
import TasksProvider from './provider/tasks';
import ThreadsProvider from './provider/threads';

export type {
	AsScript,
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
	IThreadController,
	IThreadMessage,
	IThreadQueueItem,
	IThreadQueueItemWithMeta,
	IWorkerMessage,
	IWorkerQueueItem,
};

export {
	Application,
	Autoload,
	Autowire,
	BaseModule,
	BasePlugin,
	BaseService,
	BaseTask,
	BaseThread,
	Command,
	Configure,
	Constants,
	Controller,
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
	Thread,
	ThreadContext,
	Threads,
	ThreadsProvider,
	ThreadWrapper,
	Utils,
	Worker,
	WorkerUtils,
	WorkerWrapper,
};
