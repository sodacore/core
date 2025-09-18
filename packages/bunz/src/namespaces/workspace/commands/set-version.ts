import type { ICommand, IFlagValue } from '../../../types';

export default class SetVersionCommand implements ICommand {
	public prefix = ['workspace', 'ws'];
	public names = ['set-version'];
	public description = 'Sets the version for all packages, including the root.';
	public arguments = [
		{ name: 'version', description: 'The version to set.' },
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
		console.log('SetVersionCommand executed', this.packages, this.parameters, this.flags);
		return true;
	}
}
