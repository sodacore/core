import type { ICommand } from '../types';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';

export default class implements ICommand {
	public name = 'foreach';
	public description = 'Will loop all packages and run the command against each one.';
	public arguments = [
		{ name: '...command', description: 'The command to run against each package.', required: true },
	];
	public flags = [
		{ name: '--exclude', description: 'Excludes a package (or many separated by comma) from the loop.', itemName: 'package' },
		{ name: '--specific', description: 'You can override the packages array with a custom order, will only run these if provided.', itemName: 'package' },
	];

	public constructor(private userArgs: string[], private userFlags: Record<string, string[]>) {}

	public async validate() {
		return true;
	}

	public async execute() {

		// Define the command.
		const command = this.userArgs.join(' ');
		const specific = this.userFlags['--specific'] ?? [];

		// Define excluded packages.
		const excluded = ['integration'];
		if (this.userFlags['--exclude']) {
			this.userFlags['--exclude'].forEach(exclude => {
				excluded.push(exclude);
			});
		}

		// List all packages.
		const packages = specific.length > 0
			? specific
			: (await readdir(resolve(process.cwd(), './packages')))
				.filter(name => !name.startsWith('.'))
				.filter(name => !excluded.includes(name));

		// Set base path.
		const basePath = process.cwd();

		// Loop all non-excluded packages.
		for (const name of packages) {

			// Notify console.
			console.log(`${chalk.bold('For: ')} ${chalk.yellow(name)}:`);

			// Get the full path.
			const path = resolve(basePath, `./packages/${name}`);

			// Change directory.
			process.chdir(path);

			// Run the command using node.
			execSync(command, { stdio: 'inherit' });
		}

		// Reset the base path.
		process.chdir(basePath);

		return true;
	}
}
