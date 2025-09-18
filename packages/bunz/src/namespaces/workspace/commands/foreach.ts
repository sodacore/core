import type { ICommand, IFlagValue } from '../../../types';
import { file } from 'bun';
import { execSync } from 'node:child_process';
import { chdir } from 'node:process';

export default class ForeachCommand implements ICommand {
	public prefix = ['workspace', 'ws'];
	public names = ['foreach'];
	public description = 'Runs a command for each package.';
	public arguments = [
		{ name: '...command', description: 'The command to run for the packages.' },
	];

	public constructor(
		private packages: string[],
		private parameters: string[],
		private flags: Record<string, IFlagValue>,
	) {}

	public async validate() {
		return true;
	}

	public async execute() {

		// Put the parameters together as a command.
		const commandToExecute = this.parameters.join(' ');
		if (this.flags.debug) console.log(`Command to execute: ${commandToExecute}`);

		// Loop each package and execute.
		for (const pkg of this.packages) {

			// Read the package.json.
			if (this.flags.debug) console.log(`Reading package.json at: ${pkg}/package.json`);
			const packageJsonRef = file(`${pkg}/package.json`);
			const packageJson = await packageJsonRef.json();

			// Check whether the package is private.
			if (packageJson.private || packageJson.publishConfig?.access !== 'public') {
				if (this.flags.debug) console.log(`Skipping private package: ${pkg}`);
				continue;
			};

			// Set the directory.
			if (this.flags.debug) console.log(`Changing directory to: ${pkg}`);
			chdir(pkg);

			// Execute the command.
			try {
				if (this.flags.dryRun) {
					console.log(`Dry run: ${commandToExecute} in ${pkg}`);
				} else {
					execSync(commandToExecute, { stdio: 'inherit' });
				}
			} catch (err) {
				console.error(err);
			}
		}

		return true;
	}
}
