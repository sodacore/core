import type { ICommand } from '../types';
import { resolve } from 'node:path';
import { readdir, exists } from 'node:fs/promises';
import chalk from 'chalk';

export default class implements ICommand {
	public name = 'help';
	public description = 'Read help information about a command.';
	public arguments = [
		{ name: 'command', description: 'Optional command to see help information about, or see all commands.' },
	];

	public constructor(private userArgs: string[]) {}

	public async validate() {
		return true;
	}

	public async execute() {
		if (this.userArgs[0]) {
			return await this.showHelp(this.userArgs[0]);
		} else {
			return await this.showCommands();
		}
	}

	private async showHelp(command: string) {

		// Check there is a command there.
		const path = resolve(process.cwd(), `./scripts/commands/${command}.ts`);
		const hasFile = await exists(path);
		if (!hasFile) return 'Command does not exist.';

		// Import and instantiate the module.
		const module = await import(`./${command}`);
		const instance = new module.default([]) as ICommand;

		// Build the usage.
		const usage = `bun script ${command} ` + instance.arguments?.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ') + ' ' + (instance.flags ? instance.flags.map(flag => `[${flag.name}="${flag.itemName}"]`).join(' ') : '');

		// Create a message array.
		const message: string[] = [
			chalk.bold.yellow('HELP'),
			'',
			chalk.bold('Command:'),
			`    ${chalk.yellow(instance.name)}`,
			'',
			chalk.bold('Description:'),
			`    ${chalk.yellow(instance.description)}`,
			'',
			chalk.bold('Usage:'),
			`    ${chalk.yellow(usage)}`,
			'',
			chalk.bold('Arguments:'),
			`${instance.arguments?.map(arg => `    ${chalk.yellow(arg.name)} - ${!arg.required ? chalk.red.bold('[Optional] ') : ''}${chalk.italic(arg.description)}`).join('\n') ?? '    No arguments.'}`,
			'',
			chalk.bold('Flags:'),
			`${instance.flags?.map(flag => `    ${chalk.yellow(flag.name)} - ${chalk.italic(flag.description)}`).join('\n') ?? '    No flags.'}`,
		];

		// Output message.
		console.log(message.join('\n') + '\n');
		return true;
	}

	private async showCommands() {

		// Get the path and get all files.
		const path = resolve(process.cwd(), './scripts/commands');
		const commands = await readdir(path);
		const modules: Record<string, { description: string, usage: string }> = {};

		// Let's import each command.
		for (const command of commands) {
			const module = await import(`./${command}`);
			const instance = new module.default([]) as ICommand;
			modules[instance.name] = {
				description: instance.description,
				usage: `${instance.arguments?.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ')} ${instance.flags ? chalk.italic(instance.flags?.map(flag => `[${flag.name}="${flag.itemName}"]`).join(' ')) : ''}` ?? 'No usage known.',
			};
		}

		// Now let's print the commands.
		console.log(chalk.bold('Commands:\n---\n'));
		for (const [name, { description, usage }] of Object.entries(modules)) {
			console.log(chalk.yellow(name));
			console.log(`    ${chalk.bold('Description:')} ${description}`);
			console.log(`    ${chalk.bold('Usage:')}       bun script ${name} ${usage}\n`);
		}

		return true;
	}
}
