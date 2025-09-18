import type { ICommand, IFlagValue } from '../../../types';

export default class PublishCommand implements ICommand {
	public prefix = ['workspace', 'ws'];
	public names = ['publish'];
	public description = 'Publishes all non-private (i.e. public) packages based on the private property in the package.json.';
	public arguments = [];

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
		console.log('PublishCommand executed', this.packages, this.parameters, this.flags);
		return true;
	}
}
