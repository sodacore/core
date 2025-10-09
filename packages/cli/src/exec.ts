import { log } from '@clack/prompts';
import { getConnectionByNameOrDefault } from './config';
import Application from './app';

export async function exec(args: string[]) {

	// Check for a specific connection name.
	const cleanArgs = args.filter(arg => !arg.startsWith('--connection='));
	const connectionName = args.find(arg => {
		if (!arg.startsWith('--connection=')) return false;
		return arg;
	})?.replace('--connection=', '') ?? null;

	// Get the connection information.
	const connection = await getConnectionByNameOrDefault(connectionName);
	if (!connection) {
		log.error(
			connectionName
				? `Connection with name "${connectionName}" not found, please ensure you have a connection with that name or check your spelling.`
				: 'No default connection found.',
		);
		return;
	}

	// Initialise the application.
	const app = new Application(connection, cleanArgs);
	await app.init();
}
