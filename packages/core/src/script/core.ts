import type ScriptContext from '../context/script';
import type { AsScript } from '../types';
import { Inject } from '@sodacore/di';
import { heapStats } from 'bun:jsc';
import { formatBytes } from '../helper/utils';
import { freemem, totalmem } from 'node:os';
import Namespace from '../decorator/namespace';
import Script from '../decorator/script';
import Logger from '../provider/logger';
import TasksProvider from '../provider/tasks';

@Namespace('core')
export default class CoreScripts implements AsScript<CoreScripts> {
	@Inject() private tasks!: TasksProvider;
	@Inject() private logger!: Logger;
	private listenerHandle = Symbol('CoreScripts::listenerHandle');

	@Script('logs:watch')
	public async watchLogs(context: ScriptContext) {

		// Get the socket.
		const socket = context.getSocket();

		// Add a listener on the logger to listen for messages.
		this.logger.addListener(this.listenerHandle, message => {
			context.log[message.type](message.formatted);
		});

		// Now we need to add a callback when the socket exits.
		socket.data.onExit.push(() => {
			this.logger.removeListener(this.listenerHandle);
		});

		// Log the output.
		context.log.info('Listening for logs...');
	}

	@Script('usage:info')
	public async usage() {

		// Get the heap stats.
		const stats = heapStats();

		// Define a message.
		const message: string[] = [];
		message.push(`Heap Stats:\n`);
		message.push(`⊳ System Memory Usage:      ${formatBytes(freemem().valueOf())} / ${formatBytes(totalmem().valueOf())}`);
		message.push(`⊳ Heap Size:                ${formatBytes(stats.heapSize)} / ${formatBytes(stats.heapCapacity)}`);
		message.push(`⊳ Extra Memory Size:        ${formatBytes(stats.extraMemorySize)}`);
		message.push(`⊳ Total Objects Count:      ${stats.objectCount}`);
		message.push(`⊳ Global Objects:           ${stats.globalObjectCount}`);
		message.push(`⊳ Protected Objects:        ${stats.protectedObjectCount}`);
		message.push(`⊳ Protected Global Objects: ${stats.protectedGlobalObjectCount}`);

		// Send the message.
		return message.join('\n');
	}

	@Script('task:run')
	public async taskRun(context: ScriptContext) {

		// Get a list of tasks.
		const tasks = this.tasks.getTasks();

		// Request what task they'd like to run.
		const taskId = await context.prompts.select({
			message: 'What task would you like to run?',
			options: tasks.map(task => ({
				value: task ?? 'Unknown',
				label: task ?? 'Unknown',
			})),
		});

		// If no task defined, just return to menu.
		if (taskId === null) return true;

		// Check if the task is valid.
		if (!taskId || taskId === 'Unknown') {
			context.log.error('Task not found.');
			return true;
		}

		// Check if the task is valid.
		const task = this.tasks.getTaskByName(taskId);
		if (!task) {
			context.log.error('Task not found.');
			return true;
		}

		// Execute the task.
		this.tasks.run(taskId);
		return true;
	}
}
