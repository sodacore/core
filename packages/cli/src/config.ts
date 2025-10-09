import type { IConfigCli } from './types';
import { env, file } from 'bun';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { log } from '@clack/prompts';

export const CONFIG_PATH = resolve(String(env.HOME), './.sodacore/');

export async function getConfig() {
	const configPath = resolve(CONFIG_PATH, 'cli.json');
	const configFile = file(configPath);
	if (await configFile.exists()) {
		const config = await configFile.json();
		return config as IConfigCli;
	}
	return <IConfigCli>{
		connections: [],
	};
}

export async function setConfig(config: IConfigCli) {
	try {

		// Add connections if none defined.
		if (!config.connections) config.connections = [];

		// Get the file and check if it exists.
		const configPath = resolve(CONFIG_PATH, 'cli.json');
		const configFile = file(configPath);
		const exists = await configFile.exists();

		// If the file doesn't exist, create the directory.
		if (!await configFile.exists()) {
			await mkdir(CONFIG_PATH, { recursive: true });
		}

		// Write the file.
		await configFile.write(JSON.stringify(config));

		// Log the outcome.
		log.info(exists
			? `Created new configuration file at ${configPath}`
			: `Saved configuration to ${configPath}`,
		);
		return true;
	} catch (err) {
		console.log(err);
		log.error(err instanceof Error ? err.message : String(err));
		return false;
	}
}

export async function addConnection(host: string, port: number, pass: string, name: string, isDefault = false) {
	try {

		// Get the config.
		const config = await getConfig();

		// Default the connections array.
		if (!config.connections) config.connections = [];

		// If setting this connection as default, remove the default flag from all others.
		if (isDefault) {
			for (const conn of config.connections) {
				conn.default = false;
			}
		}

		// Add the connection.
		config.connections.push({ host, port, pass, name, default: isDefault });
		await setConfig(config);

		// Return successful.
		return true;
	} catch (err) {
		log.error(err instanceof Error ? err.message : 'Unknown error');
		return false;
	}
}

export async function editConnection(index: number, host: string, port: number, pass: string, name: string, isDefault = false) {
	try {
		const config = await getConfig();
		if (!config.connections) config.connections = [];
		config.connections[index] = { host, port, pass, name, default: isDefault };
		await setConfig(config);
		return true;
	} catch (err) {
		log.error(err instanceof Error ? err.message : 'Unknown error');
		return false;
	}
}

export async function removeConnection(index: number) {
	try {
		const config = await getConfig();
		if (!config.connections) config.connections = [];
		config.connections.splice(index, 1);
		await setConfig(config);
		return true;
	} catch (err) {
		log.error(err instanceof Error ? err.message : 'Unknown error');
		return false;
	}
}

export async function getConnection(index: number) {
	const config = await getConfig();
	if (!config.connections) config.connections = [];
	return config.connections[index];
}

export async function getConnectionByNameOrDefault(name: string | null) {
	const config = await getConfig();
	if (!config.connections) return null;
	if (name) {
		const connection = config.connections.find(conn => conn.name === name);
		if (connection) return connection;
		return null;
	} else {
		const defaultConnection = config.connections.find(conn => conn.default);
		if (defaultConnection) return defaultConnection;
		return null;
	}
}
