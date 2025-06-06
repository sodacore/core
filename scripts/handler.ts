import type { ICommand } from './types';
import { exists } from 'fs/promises';
import { resolve } from 'node:path';
import chalk from 'chalk';

export default class CommandHandler {
	private command: string;
	private args: string[] = [];
	private flags: Record<string, string[]> = {};

	public constructor() {
		const args = process.argv.slice(2);
		this.command = args.splice(0, 1)[0];
		args.forEach(arg => {
			if (arg.startsWith('--')) {
				const [ name, value ] = arg.split('=');
				this.flags[name] = value ? value.replaceAll('"', '').split(',') : [];
			} else {
				this.args.push(arg);
			}
		});

		// If no args, update to help call.
		if (!this.command) this.command = 'help';
	}

	public async run() {

		// Check if file exists.
		const commandFilePath = resolve(process.cwd(), './scripts/commands', `${this.command}.ts`);
		const hasFile = await exists(commandFilePath);
		if (!hasFile) return console.log(`${chalk.red('ERR')} Command "${this.command}" does not exist.`);

		// Now import the module and validate a default.
		const module = await import(`./commands/${this.command}.ts`);
		if (!module.default) return console.log(`${chalk.red('ERR')} Command "${this.command}" does not have a default export.`);

		// Instantiate the module.
		const instance = new module.default(this.args, this.flags) as ICommand;

		// Check the arguments are valid.
		const isValid = await instance.validate();
		if (!isValid) return this.onFailure(this.command, 'Arguments are not valid.');

		// Execute the command.
		try {
			const result = await instance.execute();
			if (typeof result === 'string') return console.log(`${chalk.red('ERR')} Command "${this.command}" failed with reason: "${result}".`);
			if (result === false) return console.log(`${chalk.red('ERR')} Command "${this.command}" failed with no reason.`);
			return console.log(`${chalk.green('OK')} Command "${this.command}" completed successfully.`);
		} catch(err) {
			return this.onFailure(this.command, (err as Error).message, (err as Error));
		}
	}

	private async onFailure(command: string, reason: string, err?: Error) {
		console.log(`${chalk.red('ERR')} Command "${command}" failed with reason: "${reason}".\nSee help: "bun run script help ${command}".`);
		if (err) console.error(err);
	}
}
