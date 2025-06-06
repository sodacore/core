import type { ICommandOptions, ICommandsMeta } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Apply to all methods of a class that you want to
 * make accessible to being ran, the decorator expects
 * a command's name and options for meta information,
 * like description, and options, etc.
 *
 * Note: Classes not wrapped in this will not be loaded as Script commands.
 * @param options Optional metadata for the command.
 * @returns MethodDecorator
 * @default
 */
export default function Command(options?: ICommandOptions) {
	return (target: any, propertyKey: string | symbol) => {

		// Get the existing commands.
		const commands = Utils.getMeta<ICommandsMeta>('commands', 'script')(target, undefined, []);

		// Add the new command.
		commands.push({
			name: String(propertyKey),
			func: propertyKey,
			...options,
		});

		// Set the new commands.
		Utils.setMeta('commands', 'script')(target, commands);
	};
}
