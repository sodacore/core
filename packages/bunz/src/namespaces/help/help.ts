import type { ICommand, INamespace } from '../../types';

export default class HelpNamespace implements INamespace {
	public aliases = ['help'];
	public name = 'help';
	public description = 'Displays help information for commands.';
	public commands: ICommand[] = [];

	public constructor() {
		console.log(this.aliases);
	}

	public validate() {
		return true;
	}

	public async handle() {
		return true;
	}
}
