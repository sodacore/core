import type { IFlagValue, IParsedCommand } from '../types';

export function parseCommand(args: string[]): IParsedCommand {
	if (args.length < 2) {
		throw new Error('Not enough arguments to parse.');
	}

	const [namespace, command, ...rest] = args;
	const flags: Record<string, string | number | boolean> = {};
	const parameters: string[] = [];

	for (const arg of rest) {
		if (arg.startsWith('--')) {
			// Long flag
			const [key, value] = arg.slice(2).split('=');
			flags[toCamelCase(String(key))] = value !== undefined ? parseValue(value) : true;
		} else if (arg.startsWith('-') && arg.length > 2 && !arg.includes('=')) {
			// Combined short flags: -abc
			for (const char of arg.slice(1)) {
				flags[char] = true;
			}
		} else if (arg.startsWith('-') && arg.includes('=')) {
			// Short flag with value: -a=value
			const [key, value] = arg.slice(1).split('=');
			flags[String(key)] = parseValue(String(value));
		} else if (arg.startsWith('-')) {
			// Single short flag: -a
			flags[arg.slice(1)] = true;
		} else {
			parameters.push(arg);
		}
	}

	return {
		namespace: String(namespace),
		command: String(command),
		parameters,
		flags,
		_: parameters,
	};
}

export function parseValue(value: string): IFlagValue {
	if (value === '') return '';
	const lower = value.toLowerCase();
	if (lower === 'true') return true;
	if (lower === 'false') return false;
	if (!Number.isNaN(Number(value))) return Number(value);
	return value;
}

export function toCamelCase(flag: string): string {
	return flag.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
