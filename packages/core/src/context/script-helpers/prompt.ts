import type { IScriptPromptItem, IScriptSocketData } from '../../types';
import type { ConfirmOptions, MultiSelectOptions, SelectOptions, TextOptions } from '@clack/prompts';
import type { Socket } from 'bun';
import { v4 } from 'uuid';
import PromptGroupScriptHelper from './prompt-group';

export default class PromptScriptHelper {
	public constructor(
		private send: (command: string, context?: Record<string, any>) => void,
		private socket: Socket<IScriptSocketData>,
	) {}

	public async text(options: Omit<TextOptions, 'validate'>) {
		const result = await this.sendRequest<{ value: string | null }>([{
			type: 'text',
			key: 'value',
			options,
		}]);
		if (!result || !result.value) return null;
		return result.value as string;
	}

	public async confirm(options: ConfirmOptions) {
		const result = await this.sendRequest<{ value: boolean }>([{
			type: 'confirm',
			key: 'value',
			options,
		}]);
		if (!result) return null;
		return result.value as boolean;
	}

	public async select<T = string>(options: SelectOptions<T>) {
		if (options.options.length === 0) throw new Error('Select options cannot be empty.');
		const result = await this.sendRequest<{ value: T | null }>([{
			type: 'select',
			key: 'value',
			options,
		}]);
		if (!result || !result.value) return null;
		return result.value as T;
	}

	public async multiselect<T = string[]>(options: MultiSelectOptions<T>) {
		if (options.options.length === 0) throw new Error('MultiSelect options cannot be empty.');
		const result = await this.sendRequest<{ value: T[] | null }>([{
			type: 'multiselect',
			key: 'value',
			options,
		}]);
		if (!result || !result.value) return null;
		return result.value as T;
	}

	public createGroup() {
		return new PromptGroupScriptHelper(this.sendRequest.bind(this));
	}

	private async sendRequest<T>(commands: IScriptPromptItem[]) {
		if (commands.length === 0) return null;
		const uid = v4();
		return new Promise<T>(resolve => {
			this.socket.data.results[uid] = resolve;
			this.send('_:interact', { uid, commands });
		});
	}
}
