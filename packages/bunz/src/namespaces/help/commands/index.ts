import type { ICommand, IFlagValue } from '../../../types';

export default class HelpCommand implements ICommand {
	public prefix = [];
	public names = ['help'];
	public description = 'Displays help information for commands.';
	public arguments = [];

	public constructor(
		private packages: string[],
		private parameters: string[],
		private flags: Record<string, IFlagValue>,
		private commands: ICommand[],
	) {
		console.log(this.commands);
	}

	public async validate() {
		return true;
	}

	public async execute() {
		// if (this.)
		// Execute the command.
		// Return true or false if it worked.
		console.log('HelpCommand executed', this.packages, this.parameters, this.flags, this.commands);
		return true;
	}

	// private index() {
	// 	console.log('HelpCommand index called');
	// }
}
