import type { ICommand, INamespace } from '../../types';

export default class WorkspaceNamespace implements INamespace {
	public aliases = ['workspace', 'workspaces', 'ws'];
	public name = 'workspace';
	public description = 'Commands related to workspace management, such as publishing and running commands across packages.';
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
