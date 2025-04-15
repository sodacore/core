import type { ICommand } from '../types';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import chalk from 'chalk';

export default class implements ICommand {
	public name = 'set-version';
	public description = 'Will set the version for all packages including the root.';
	public arguments = [
		{ name: 'version', description: 'The version to set against each package.', required: true },
	];

	public constructor(private userArgs: string[]) {}

	public async validate() {
		const version = this.userArgs[0] ?? '';
		return !!version.match(/^\d+\.\d+\.\d+$/);
	}

	public async execute() {

		// List all packages.
		const packages = await readdir(resolve(process.cwd(), './packages'));

		// Get root package json.
		const rootPackageJson = JSON.parse(await readFile(resolve(process.cwd(), './package.json'), 'utf-8'));

		// Update the version and write the file.
		rootPackageJson.version = this.userArgs[0];
		writeFile(resolve(process.cwd(), './package.json'), JSON.stringify(rootPackageJson, null, '\t') + '\n');

		// Loop all packages and set their version.
		packages.forEach(async name => {

			// Notify console.
			console.log(chalk.yellow(`Updating version of: "${name}".`));

			// Get the package json.
			const packageJson = JSON.parse(await readFile(resolve(process.cwd(), `./packages/${name}/package.json`), 'utf-8'));
			packageJson.version = rootPackageJson.version;

			// Write the file back.
			await writeFile(resolve(process.cwd(), `./packages/${name}/package.json`), JSON.stringify(packageJson, null, '\t') + '\n');
		});

		return true;
	}
}
