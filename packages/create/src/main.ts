import { cancel, confirm, intro, isCancel, log, multiselect, outro, tasks, text } from '@clack/prompts';
import { inverse } from 'picocolors';
import { chdir, cwd, exit } from 'node:process';
import { resolve } from 'node:path';
import { mkdir, rm } from 'node:fs/promises';
import { $, file, write } from 'bun';
import { getFiles } from './files';

console.log('');
intro(inverse(' Create Sodacore '));

// Ask for the project name.
const projectName = await text({
	message: 'What is the project name?',
	defaultValue: 'sodacore-project',
	placeholder: 'sodacore-project',
});
if (isCancel(projectName)) {
	cancel('Operation cancelled');
	exit(0);
}

// Ask for the project path.
const projectBasePath = await text({
	message: 'What is the project path?',
	defaultValue: cwd(),
	placeholder: cwd(),
});
if (isCancel(projectBasePath)) {
	cancel('Operation cancelled');
	exit(0);
}

// Confirm the path.
const isPathConfirmed = await confirm({
	message: `Is the project path ${projectBasePath}/${projectName} correct?`,
});
if (isCancel(isPathConfirmed)) {
	cancel('Operation cancelled');
	exit(0);
}

// Define the project.
const projectPath = `${projectBasePath}/${projectName}`;

// What plugins should be installed?
const plugins = await multiselect({
	message: 'What plugins would you like to install? (Use space to select, enter to confirm)',
	options: [
		{ value: '@sodacore/http@alpha', label: 'HTTP' },
		{ value: '@sodacore/ws@alpha', label: 'WebSockets' },
		{ value: '@sodacore/prisma@alpha', label: 'Prisma' },
		{ value: '@sodacore/discord@alpha', label: 'Discord' },
	],
});
if (isCancel(plugins)) {
	cancel('Operation cancelled');
	exit(0);
}

// Add the base packages.
const packages = ['@sodacore/di@alpha', '@sodacore/core@alpha'];
packages.push(...plugins);

// Run the tasks.
await tasks([
	{
		title: 'Initialising project folder',
		task: async () => {
			await mkdir(projectPath, { recursive: true });
			chdir(projectPath);
			$.cwd(projectPath);
			await $`bun init -y`.quiet();
			await rm(resolve(projectPath, './index.ts'));
			await mkdir(resolve(projectPath, './src'), { recursive: true });
			return 'Initialised project folder';
		},
	},
	{
		title: 'Installing dependencies',
		task: async () => {
			chdir(projectPath);
			await $`bun install ${{ raw: packages.join(' ') }}`.quiet();
			return 'Dependencies installed';
		},
	},
	{
		title: 'Creating template files',
		task: async () => {
			const files = getFiles(packages);
			const createdFiles: string[] = [];
			for (const file of files) {
				if (!packages.includes(file.package)) continue;
				const filePath = resolve(projectPath, file.path);
				await mkdir(resolve(projectPath, file.path.split('/').slice(0, -1).join('/')), { recursive: true });
				await write(filePath, file.content);
				createdFiles.push(filePath);
			}
			return `Created ${createdFiles.length} files:\n${createdFiles.map(file => `- ${file}`).join('\n')}`;
		},
	},
	{
		title: 'Modifying files with context information.',
		task: async () => {

			// Load the JSON file.
			const packageJson = file(resolve(projectPath, './package.json'));
			if (!await packageJson.exists()) {
				cancel('Package.json not found.');
				exit(1);
			}

			// Write the version and script.
			const packageMeta = await packageJson.json();
			packageMeta.version = '0.0.0';
			packageMeta.scripts = {};
			packageMeta.scripts.dev = 'bun run ./src/main.ts';
			await packageJson.write(JSON.stringify(packageMeta, null, '\t'));
		},
	},
]);

// Log the outcome.
log.success(`Created project at ${projectPath}\n\nRun \`cd ${projectPath}\` and \`bun run dev\` to get started the project.`);

outro(`Done! Check out our docs at https://sodacore.dev for more information.`);
