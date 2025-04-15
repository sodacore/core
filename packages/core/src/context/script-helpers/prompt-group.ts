import type { ConfirmOptions, MultiSelectOptions, SelectOptions, TextOptions } from '@clack/prompts';
import type { IScriptPromptItem } from '../../types';

export default class PromptGroupScriptHelper {
	private commands: IScriptPromptItem[] = [];

	public constructor(
		private sendRequest: <T>(commands: IScriptPromptItem[]) => Promise<T | null>,
	) {}

	public addText(key: string, options: Omit<TextOptions, 'validate'>) {
		this.commands.push({
			type: 'text',
			key,
			options,
		});
		return this;
	}

	public addConfirm(key: string, options: ConfirmOptions) {
		this.commands.push({
			type: 'confirm',
			key,
			options,
		});
		return this;
	}

	public addSelect<T = string>(key: string, options: SelectOptions<T>) {
		if (options.options.length === 0) throw new Error('Select options cannot be empty.');
		this.commands.push({
			type: 'select',
			key,
			options,
		});
		return this;
	}

	public addMultiselect<T = string[]>(key: string, options: MultiSelectOptions<T>) {
		if (options.options.length === 0) throw new Error('MultiSelect options cannot be empty.');
		this.commands.push({
			type: 'multiselect',
			key,
			options,
		});
		return this;
	}

	public send<T = Record<string, any>>() {
		return this.sendRequest<T>(this.commands);
	}

	public clear() {
		this.commands = [];
		return this;
	}
}
