import type { ICommand } from '../types';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

export default class implements ICommand {
	public name = 'for';
	public description = 'Will loop all packages and run the command against each one.';
	public arguments = [
		{ name: 'package', description: 'The package to run the command for.' },
		{ name: '...command', description: 'The command to run against each package.' },
	];

	public constructor(private userArgs: string[]) {}

	public async validate() {
		return true;
	}

	public async execute() {

		// Define the command.
		const packageName = this.userArgs[0];
		const command = this.userArgs.slice(1).join(' ');

		// Set base path.
		const basePath = process.cwd();
		const packagePath = resolve(basePath, `./packages/${packageName}`);

		// Change directory.
		process.chdir(packagePath);

		// Run the command using node.
		execSync(command, { stdio: 'inherit' });

		// Reset the base path.
		process.chdir(basePath);

		return true;
	}
}
