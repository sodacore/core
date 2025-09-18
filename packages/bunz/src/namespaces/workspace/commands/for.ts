import type { ICommand, IFlagValue } from '../../../types';

export default class ForCommand implements ICommand {
	public prefix = ['workspace', 'ws'];
	public names = ['for'];
	public description = 'Runs a command for a specific package.';
	public arguments = [
		{ name: 'package', description: 'The package to run the command for.' },
		{ name: '...command', description: 'The command to run for the package.' },
	];

	public constructor(
		private packages: string[],
		private parameters: string[],
		private flags: Record<string, IFlagValue>,
	) {}

	public async validate() {
		// Validate the user args.
		// Return true or false, if it was valid.
		return true;
	}

	public async execute() {
		// Execute the command.
		// Return true or false if it worked.
		console.log('ForCommand executed', this.packages, this.parameters, this.flags);
		return true;
	}
}
