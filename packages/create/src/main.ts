import { cancel, confirm, intro, isCancel, log, outro, select, text } from '@clack/prompts';
import { inverse } from 'picocolors';
import { cwd, exit } from 'node:process';
import { mkdir } from 'node:fs/promises';
import { $ } from 'bun';

// Define constants.
let templates: Record<string, any>[] = [];
let files: Array<{ source: string, destination: string }> = [];

// Note the introduction.
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

log.success('Downloading templates...');

// Request the available templates.
try {
	const response = await fetch('https://raw.githubusercontent.com/sodacore/templates/refs/heads/main/templates.json');
	templates = await response.json() as any[];
} catch (err) {
	cancel(`Failed to fetch templates: ${(err as Error).message}`);
	exit(1);
}

// If no templates are found, exit.
if (!templates || templates.length === 0) {
	cancel('No templates found. Please try again later.');
	exit(1);
}

// Choose a template.
const template = await select({
	message: 'Choose a project template',
	options: [
		...templates.map(t => ({ value: t.id, label: t.name, hint: t.description })),
		{ value: 'community', label: 'Community Template', hint: 'This will download a community template from Github' },
	],
});
if (isCancel(template)) {
	cancel('Operation cancelled');
	exit(0);
}

// If the template is a community template, ask for the user and name.
if (template === 'community') {

	// Confirm the user wants to use a community template.
	const isCommunityConfirmed = await confirm({
		message: 'Are you sure you want to use a community template? These templates are not verified by the Sodacore team and may be unsafe, please ensure you check the code before running it on your machine.',
		initialValue: false,
	});
	if (isCancel(isCommunityConfirmed) || !isCommunityConfirmed) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Ask for the repository.
	const communityUser = await text({
		message: 'What is the user/repository of the community template (on Github)?',
		placeholder: 'user/repository',
	});
	if (isCancel(communityUser)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Ask for the branch.
	const communityBranch = await text({
		message: 'What is the branch of the community template?',
		placeholder: 'main',
		defaultValue: 'main',
	});
	if (isCancel(communityBranch)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Create community repo path and load the files list.
	const communityRepo = `https://raw.githubusercontent.com/${communityUser}/refs/heads/${communityBranch}/template.json`;
	const response = await fetch(communityRepo);
	if (!response.ok) {
		cancel(`Failed to fetch community template: ${response.statusText}`);
		exit(1);
	}
	const templateData = await response.json().catch(() => null) as any;
	if (!templateData || !templateData.files || templateData.files.length === 0) {
		cancel('No valid template data found in the community repository.');
		exit(1);
	}

	// Set the files to download.
	files = templateData.files;
} else {
	files = templates.find(t => t.id === template)?.files || [];
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

// Define the project path.
const projectPath = `${projectBasePath}/${projectName}`;
log.info(`Creating project in ${projectPath}`);

// Create the folder if it doesn't exist.
await mkdir(projectPath, { recursive: true }).catch(reason => {
	cancel(`Failed to create project folder: ${reason}`);
	exit(1);
});

// Now loop the files and download them.
for (const file of files) {
	log.message(`Downloading ${file.source} ...`);
	try {
		const response = await fetch(file.source);
		if (!response.ok) {
			cancel(`Failed to download file ${file.source}: ${response.statusText}`);
			exit(1);
		}
		const content = await response.text();
		await mkdir(`${projectPath}/${file.destination.split('/').slice(0, -1).join('/')}`, { recursive: true });
		await import('node:fs/promises').then(fs => fs.writeFile(`${projectPath}/${file.destination}`, content));
	} catch (err) {
		cancel(`Failed to download file ${file.source}: ${(err as Error).message}`);
		exit(1);
	}
}

// Ask if the user wants to install dependencies.
const shouldInstall = await confirm({
	message: 'Do you want to install dependencies now?',
	initialValue: true,
});
if (isCancel(shouldInstall)) {
	cancel('Operation cancelled');
	exit(0);
}

// If yes, install the dependencies.
if (shouldInstall) {
	log.step('Installing dependencies...');
	try {
		await $`cd ${projectPath} && bun install`.quiet();
	} catch (err) {
		cancel(`Failed to install dependencies: ${(err as Error).message}`);
		exit(1);
	}
}

outro(`Done! Check out our docs at https://sodacore.dev for more information.`);
