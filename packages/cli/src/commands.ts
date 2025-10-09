/* eslint-disable ts/naming-convention */
import type { ISocketData } from './types';
import type { Socket } from 'bun';
import { confirm, group, isCancel, log, multiselect, select, text } from '@clack/prompts';

export default class Commands {
	private socket!: Socket<ISocketData>;
	private commands: Record<string, (context: any) => boolean | Promise<boolean>> = {
		'_:authenticate': this.handleAuthenticate.bind(this),
		'_:error': this.handleError.bind(this),
		'_:commands': this.handleCommands.bind(this),
		'_:interact': this.handleInteract.bind(this),
		'_:log': this.handleLog.bind(this),
		'_:menu': this.handleMenu.bind(this),
		'_:exit': this.handleExit.bind(this),
	};

	public constructor(
		private exitHandler: (value?: string) => void,
		private answers: string[] = [],
		private closeAfter = false,
	) {}

	public setSocket(socket: Socket<ISocketData>) {
		this.socket = socket;
	}

	public async handle(command: string, context: Record<string, any>) {

		// Check if the command exists.
		if (!this.commands[command]) {
			log.error(`Command ${command} not found.`);
			return false;
		}

		// Check if the socket is authenticated.
		if (!this.socket.data.authenticated && !command.startsWith('_:')) {
			log.error('Socket is not authenticated.');
			return false;
		}

		// Check if the command is valid.
		const status = await this.commands[command](context);
		if (status === false) return false;
		return true;
	}

	private async handleAuthenticate(context: { status: boolean }) {
		if (context.status) {
			log.success('Connection was successfully authenticated.');
			this.socket.data.authenticated = true;
			this.write('_:commands');
		} else {
			log.error('Connection was not authenticated, the connection will be closed.');
			this.socket.data.authenticated = false;
		}
		return true;
	}

	private async handleError(context: { message: string }) {
		log.error(`Error: ${context.message}`);
		return true;
	}

	private async handleCommands(context: { commands: string[] }) {

		if (this.answers.length === 0 && this.closeAfter) {
			this.exitHandler();
			return true;
		}

		if (this.answers.length > 0) {
			const answer = this.answers.shift()!;
			this.write(String(answer));
			return true;
		}

		if (context.commands.length === 0) {
			log.info('No commands available.');
			return false;
		}

		// Define the command the user wants to run.
		const commandToRun = await select({
			message: 'What command do you want to run?',
			options: context.commands.map(command => ({
				value: command,
				label: command,
			})),
		});
		if (isCancel(commandToRun)) {
			log.error('Operation cancelled, closing connection.');
			this.exitHandler('Operation cancelled');
		}

		// Send the command to the server.
		this.write(String(commandToRun));
		return true;
	}

	private async handleInteract(context: { commands: any, uid: string }) {

		// Create the prompts group.
		const prompts = context.commands.reduce((prompts: any, command: any) => {
			if (command.type === 'text') {
				prompts[command.key] = () => text(command.options);
			} else if (command.type === 'confirm') {
				prompts[command.key] = () => confirm(command.options);
			} else if (command.type === 'select') {
				prompts[command.key] = () => select(command.options);
			} else if (command.type === 'multiselect') {
				prompts[command.key] = () => multiselect(command.options);
			}
			return prompts;
		}, {});

		// Request the results.
		const results: Record<string, any> = await group(prompts, {
			onCancel: () => {
				log.error('Operation cancelled, will send null for this question.');
				return true;
			},
		});

		// Loop the results and check if the user cancelled the operation.
		Object.keys(results).forEach(key => {
			if (results[key] === 'canceled') {
				results[key] = null;
			}
		});

		// Send the results back to the server.
		this.write('_:interact', { uid: context.uid, results });

		// Return true.
		return true;
	}

	private async handleMenu(context?: { message?: string }) {
		if (context?.message) log.info(context?.message);
		this.write('_:commands');
		return true;
	}

	private async handleLog(context: { type: 'error' | 'info' | 'message' | 'step' | 'success' | 'warn' | 'warning', message: string }) {
		log[context.type](context.message);
		return true;
	}

	private async handleExit(context: { message: string }) {
		log.error(`Connection closed: ${context.message}`);
		this.exitHandler(context.message);
		return true;
	}

	private write(command: string, context: Record<string, any> = {}) {
		this.socket.write(JSON.stringify({ _uid: this.socket.data.uid, command, context }));
	}
}
