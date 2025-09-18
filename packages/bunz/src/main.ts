import CommandHandler from './module/handler';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { file } from 'bun';
import { intro, outro } from '@clack/prompts';

// Get the CLI version.
const rootFolder = resolve(import.meta.dirname, '../');
const rootPackage = file(`${rootFolder}/package.json`);
const rootPackageJson = await rootPackage.json();
const versionString = String(rootPackageJson.version ?? 'UNKNOWN');

// Write the banner.
const letterB = chalk.hex('#F0D583').bold('B');
const letterU = chalk.yellow.bold('U');
const letterN = chalk.hex('#633200').bold('N');
const letterZ = chalk.hex('#F0D583').bold('Z');

// Start the root.
console.log('');
intro(`🍔 ${letterB}${letterU}${letterN}${letterZ} :: v${versionString} 🍔`);
await new CommandHandler().run();
outro('Thanks for using Sodacore!');

/*

	bunz help
	bunz help <topic>

	bunz workspace foreach bun run build --debug --test="value"
	bunz ws foreach bun run build --debug --test="value"

	Folder Structure:
	- Commands
		- Prefix
			- Command1
			- Command2
			- Command3

	Example:
	- commands
		- help
			- index
		- workspace
			- index
			- foreach
			- for
			- publish
			- set-version
		- default

*/
