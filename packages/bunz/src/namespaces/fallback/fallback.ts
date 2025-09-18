import type { ICommand, INamespace } from '../../types';

export default class FallbackNamespace implements INamespace {
	public aliases: string[] = [];
	public name = 'fallback';
	public description = 'Fallback command for unrecognized commands.';
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
