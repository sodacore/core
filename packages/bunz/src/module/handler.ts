import type { INamespace, IParsedCommand } from '../types';
import { file } from 'bun';
import { readdir } from 'node:fs/promises';
import { parseCommand } from '../helper/utils';
import { argv, cwd, exit } from 'node:process';
import FallbackNamespace from '../namespaces/fallback/fallback';
import HelpNamespace from '../namespaces/help/help';
import WorkspaceNamespace from '../namespaces/workspace/workspace';
import { cancel } from '@clack/prompts';

export default class CommandHandler {
	private workspaces: string[] = [];
	private packages: string[] = [];
	private command: IParsedCommand;
	private current = cwd();
	private namespaces: INamespace[] = [];

	public constructor() {

		// Slice and parse the command.
		let args = argv.slice(2);
		if (args.length < 1) args = ['help', 'index'];
		if (args.length < 2) args.push('index');
		this.command = parseCommand(args);

		// Initialise the namespaces.
		this.namespaces.push(new FallbackNamespace());
		this.namespaces.push(new HelpNamespace());
		this.namespaces.push(new WorkspaceNamespace());
	}

	public async init() {

		// Read workspaces from the package.json.
		const packageJsonRef = file(`${this.current}/package.json`);
		const packageJson = await packageJsonRef.json();

		// Get the workspace folders.
		const pkgWorkspaces: string[] = packageJson.workspaces || [];
		this.workspaces = pkgWorkspaces.map(workspace => `${this.current}/${workspace}`);

		// Now list all packages within the workspaces.
		for (const workspace of this.workspaces) {
			const workspaceWithoutSuffix = workspace.split('/').slice(0, -1).join('/');
			const folders = await readdir(workspaceWithoutSuffix);
			this.packages.push(...folders.map(f => `${workspaceWithoutSuffix}/${f}`));
		}
	}

	public async run() {
		await this.init();

		// Get the namespace.
		const namespace = this.namespaces.find(ns => {
			return ns.aliases.includes(this.command.namespace);
		});

		// If no namespace, then use the fallback namespace.
		if (!namespace) {

			// Default the namespace and command.
			this.command.namespace = 'fallback';
			this.command.command = 'index';

			// Run the fallback namespace handler.
			const fallbackNamespace = this.namespaces.find(ns => ns.name === 'fallback')!;
			return fallbackNamespace.handle(this.command);
		}

		// Validate the command.
		if (!namespace.validate()) {
			cancel('The command is invalid.');
			exit(1);
		}

		// Handle the command.
		return namespace.handle(this.command);
	}
}
