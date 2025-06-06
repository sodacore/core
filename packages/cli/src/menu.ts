import type { IConfigConnectionItem } from './types';
import { cancel, isCancel, select, text } from '@clack/prompts';
import { addConnection, getConfig, removeConnection } from './config';
import { exit } from 'node:process';
import Application from './app';

export async function main() {

	// Get the config.
	const config = await getConfig();

	// What would you like to do?
	const intention = await select({
		message: 'What would you like to do?',
		options: [
			{ value: 'add', label: 'Add a new connection' },
			{ value: 'remove', label: 'Remove a connection' },
			...config.connections.map(config => ({
				value: `${config.host}:${config.port}:${config.pass}`,
				label: `Access: ${config.name ?? `${config.host}:${config.port}`}`,
			})),
		],
	});
	if (isCancel(intention)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Validate the intention.
	if (intention === 'add') {
		await addConnectionMenu();
	} else if (intention === 'remove') {
		await removeConnectionMenu();
	} else {
		const [host, port, pass] = intention.split(':');
		const connection = config.connections.find(c => c.host === host && c.port === Number.parseInt(port) && c.pass === pass);
		if (!connection) {
			cancel('Invalid connection');
			exit(1);
		}
		await accessConnectionMenu(connection);
	}
}

export async function addConnectionMenu() {

	// Ask for available hostname.
	const hostName = await text({
		message: 'What hostname would you like to access?',
		defaultValue: 'localhost',
		placeholder: 'localhost',
	});
	if (isCancel(hostName)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Ask for available port.
	const port = await text({
		message: 'What port would you like to access?',
		defaultValue: '36445',
		placeholder: '36445',
	});
	if (isCancel(port)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Ask for CLI password.
	const password = await text({
		message: 'What is the CLI password?',
		defaultValue: '',
		placeholder: 'This is set as a config option in the CLI project.',
	});
	if (isCancel(password)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Ask for a name.
	const name = await text({
		message: 'What name would you like to give this connection?',
		defaultValue: `${hostName}:${port}`,
		placeholder: `${hostName}:${port}`,
	});
	if (isCancel(name)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Get the config.
	const status = await addConnection(hostName, Number.parseInt(port), password, name);
	if (!status) {
		cancel('Failed to add connection');
		exit(1);
	}

	// Return to main menu.
	await main();
}

export async function removeConnectionMenu() {

	// Get the config.
	const config = await getConfig();

	// Show the available connections.
	const connectionId = await select({
		message: 'Select a connection to remove',
		options: config.connections.map((connection, index) => ({
			value: index,
			label: `${connection.host}:${connection.port}`,
		})),
	});
	if (isCancel(connectionId)) {
		cancel('Operation cancelled');
		exit(0);
	}

	// Remove the connection.
	const status = await removeConnection(connectionId);
	if (!status) {
		cancel('Failed to remove connection');
		exit(1);
	}

	// Return to main menu.
	await main();
}

export async function accessConnectionMenu(connection: IConfigConnectionItem) {
	const app = new Application(connection);
	const message = await app.init();
	if (message) {
		cancel(message);
		exit(1);
	}
}
