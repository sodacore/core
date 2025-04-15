import type { IScriptSocketData } from '../types';
import type { Socket } from 'bun';
import LogScriptHelper from './script-helpers/log';
import SessionScriptHelper from './script-helpers/session';
import PromptScriptHelper from './script-helpers/prompt';

export default class ScriptContext {
	public log: LogScriptHelper;
	public session: SessionScriptHelper;
	public prompts: PromptScriptHelper;

	public constructor(
		private socket: Socket<IScriptSocketData>,
		private command: string,
		private context?: Record<string, any>,
	) {
		this.log = new LogScriptHelper(this.send.bind(this));
		this.session = new SessionScriptHelper(socket);
		this.prompts = new PromptScriptHelper(this.send.bind(this), socket);
	}

	public getSocket() {
		return this.socket;
	}

	public getCommand() {
		return this.command;
	}

	public getContext<T = Record<string, any>>(key?: string) {
		if (key) return this.context?.[key] as T;
		return this.context as T;
	}

	public send(command: string, context: Record<string, any> = {}) {
		this.socket.write(JSON.stringify({ command, context }));
	}
}
