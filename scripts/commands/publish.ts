import type { ICommand } from '../types';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { $ } from 'bun';
import chalk from 'chalk';

export default class implements ICommand {
	public name = 'publish';
	public description = 'Publishes all packages in the workspace, with auto resolving of the dependencies.';
	public arguments = [
		{ name: 'version', description: 'The version to publish all packages under, or you can use patch, minor or major to increase that part of the version.', required: true },
		{ name: 'tag', description: 'The tag to publish the packages under.', required: false },
	];
	public flags = [
		{ name: '--exclude', description: 'Excludes a package (or many separated by comma) from the publish process.', itemName: 'package' },
	];

	public constructor(private userArgs: string[], private userFlags: Record<string, string[]>) {}

	public async validate() {
		const version = this.userArgs[0] ?? '';
		if (!version) return false;
		if (version.includes('.')) {
			return !!version.match(/^\d+\.\d+\.\d+$/);
		} else {
			return ['patch', 'minor', 'major'].includes(version);
		}
	}

	public async execute() {

		// List all packages.
		const packages = await readdir(resolve(process.cwd(), './packages'));
		const ignored = ['integration'];
		if (this.userFlags['--exclude']) {
			this.userFlags['--exclude'].forEach(exclude => {
				ignored.push(exclude);
			});
		}

		// Get root package json.
		const rootPackageJson = JSON.parse(await readFile(resolve(process.cwd(), './package.json'), 'utf-8'));

		// Check the user arg and increase the version.
		const version = this.userArgs[0];
		if (version === 'patch') {
			const [ major, minor, patch ] = rootPackageJson.version.split('.').map(Number);
			rootPackageJson.version = `${major}.${minor}.${patch + 1}`;
		} else if (version === 'minor') {
			const [ major, minor, patch ] = rootPackageJson.version.split('.').map(Number);
			rootPackageJson.version = `${major}.${minor + 1}.${patch}`;
		} else if (version === 'major') {
			const [ major, minor, patch ] = rootPackageJson.version.split('.').map(Number);
			rootPackageJson.version = `${major + 1}.${minor}.${patch}`;
		} else {
			rootPackageJson.version = version;
		}

		// Update the root package.
		writeFile(resolve(process.cwd(), './package.json'), JSON.stringify(rootPackageJson, null, '\t') + '\n');
		const depKeys = ['dependencies', 'devDependencies', 'peerDependencies'];

		// Get the base path.
		const basePath = process.cwd();

		// Update package dependencies with new version.
		for (const name of packages) {

			// If ignored, skip.
			if (ignored.includes(name)) continue;

			// Notify console.
			console.log(chalk.yellow(`Resolving the versions in: "${name}".`));

			// Get the package json.
			const packageJson = JSON.parse(await readFile(resolve(basePath, `./packages/${name}/package.json`), 'utf-8'));
			packageJson.version = rootPackageJson.version;

			// Check if the package is private.
			if (packageJson.private) {
				console.log(chalk.yellow(`Skipping the private package: "${name}".`));
				continue;
			}

			// Loop the dependencies and update.
			depKeys.forEach(depKeyName => {
				Object.keys(packageJson[depKeyName] ?? {}).forEach(dependencyName => {
					if (dependencyName.startsWith('@sodacore/')) {
						packageJson.dependencies[dependencyName] = `^${rootPackageJson.version}`;
					}
				});
			});

			// Write the file back.
			await writeFile(resolve(basePath, `./packages/${name}/package.json`), JSON.stringify(packageJson, null, '\t') + '\n');

			// Now define the path and move to it.
			const packagePath = resolve(basePath, `./packages/${name}`);
			process.chdir(packagePath);

			// Now run the publish.
			const tag = this.userArgs[1] ?? 'latest';
			await $`npm publish --tag ${tag}`;

			// Notify console.
			console.log(chalk.yellow(`Reverting the versions in: "${name}".`));

			// Loop the dependencies and update.
			depKeys.forEach(depKeyName => {
				Object.keys(packageJson[depKeyName] ?? {}).forEach(dependencyName => {
					if (dependencyName.startsWith('@sodacore/')) {
						packageJson.dependencies[dependencyName] = 'workspace:*';
					}
				});
			});

			// Write the file back.
			await writeFile(resolve(basePath, `./packages/${name}/package.json`), JSON.stringify(packageJson, null, '\t') + '\n');
		}

		// Set directory back to root.
		process.chdir(basePath);
		await $`git add .; git commit -m "chore: release v${rootPackageJson.version}"; git push; git tag v${rootPackageJson.version}; git push origin main --tags`;

		return true;
	}
}
