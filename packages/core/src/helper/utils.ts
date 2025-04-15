import { unlink } from 'node:fs/promises';
import process from 'node:process';
import { file, write } from 'bun';

/**
 * The normalise function is used to convert a path to
 * a standard format, removing any windows based slashes.
 * @param path The path to normalise.
 * @returns string
 */
export function normalise(path: string) {
	return path.replace(/\\/g, '/');
}

/**
 * The resolve method is used to resolve a path, it will
 * take a base path and then resolve and then add any extra
 * parts to the path, allowing for using `./` and `../`.
 * @param base The base path to start with.
 * @param paths An array of extra paths to add/resolve.
 * @returns string
 */
export function resolve(base: string, ...paths: string[]) {
	const parts = normalise(base).split('/');
	paths.forEach(part => {
		const subParts = part.split('/')
			.map(p => p.replaceAll('\\', '/'))
			.filter(p => p !== '');
		subParts.forEach(subPart => {
			if (subPart === '..') {
				parts.pop();
			} else {
				parts.push(subPart);
			}
		});
	});
	return `/${parts.filter(p => p !== '').join('/')}`;
}

/**
 * Will get the filename passed into the worker and thread
 * bootstrap processes, so that the module can be loaded via
 * the worker/thread wrappers.
 * @returns string
 */
export function getThreadFileFromArgs() {
	const fileArg = process.argv.find(arg => arg.startsWith('--file='));
	if (!fileArg) throw new Error('Thread file not found in args, when spawning the process.');
	return fileArg.split('=')[1];
}

/**
 * Will attempt to parse the given data string as JSON,
 * if it fails, it's not JSON, if it succeeds, it's
 * valid JSON.
 * @param data The data string to check.
 * @returns boolean
 */
export function isJson(data: string) {
	try {
		JSON.parse(data);
		return true;
	} catch {
		return false;
	}
}

/**
 * Similar to isJson, but used to check if an object can
 * be serialised.
 * @param value The value to check.
 * @returns boolean
 */
export function isConvertable(value: any) {
	try {
		JSON.stringify(value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Will attempt to write a PID file to the system, this is
 * currently not in use due to some issues found with Bun's
 * ability to keep alive after starting to exit.
 * @param name The name to write.
 * @returns void
 * @async
 */
export async function writePid(name?: string) {

	// Define the process name and path.
	const processName = String(name ?? 'main').toLowerCase().replace(/[^a-z0-9]/g, '');
	const path = resolve(process.cwd(), `/var/run/${processName}.pid`);

	// Create a file reference, and validate it doesn't exist.
	const pidFile = file(path);
	if (await pidFile.exists()) {
		throw new Error(`PID file for: ${processName} already exists, check you don't have a process running.`);
	}

	// Write the PID to the file.
	const result = await write(path, process.pid.toString());
	if (!result) {
		throw new Error(`Failed to write PID to file: ${path}`);
	}
}

/**
 * Will attempt to remove a PID file from the system, this is
 * currently not in use due to some issues found with Bun's
 * ability to keep alive after starting to exit.
 * @param name The name to remove.
 * @returns void
 * @async
 */
export async function removePid(name?: string) {

	// Define the process name and path.
	const processName = String(name ?? 'main').toLowerCase().replace(/[^a-z0-9]/g, '');
	const path = resolve(process.cwd(), `/var/run/${processName}.pid`);

	// Create a file reference, and validate it exists.
	const pidFile = file(path);
	if (!await pidFile.exists()) {
		throw new Error(`PID file for: ${processName} does not exist, check you have a process running.`);
	}

	// Remove the PID file.
	await unlink(path);
}

/**
 * Will get a file path based on the NODE_ENV status, whether it is
 * development, or production, and will return the correct path.
 * @param path Relative path to the file.
 * @returns string
 */
export function getFilePath(path: string) {
	const isDev = process.env.NODE_ENV === 'development';
	return isDev ? import.meta.filename : resolve(import.meta.filename, path);
}

/**
 * Will parse a script packet from the given data string, and
 * return the UID, command and context of the packet. If the
 * packet is invalid, it will return null.
 * @param data The data string to parse.
 * @returns Record<string, any>
 */
export function parseScriptPacket(data: string) {
	try {
		const packet = JSON.parse(data);
		return <{ command: string, context: Record<string, any> }>{
			command: packet.command,
			context: packet.context ?? {},
		};
	} catch {
		return null;
	}
}

/**
 * Will format a given bytes value to a human readable format,
 * using either binary or decimal values. The default is decimal.
 * @param bytes The bytes value to format.
 * @param decimals The number of decimals to use.
 * @param isBinary Whether to use binary or decimal values.
 * @returns string
 */
export function formatBytes(bytes: number, decimals = 2, isBinary = false) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // or ['B', 'KB', 'MB', 'GB', 'TB']
	if (!+bytes) return `0 ${sizes[0]}`;

	const inByte = isBinary ? 1024 : 1000;
	const dm = decimals < 0 ? 0 : decimals;

	const pow = Math.floor(Math.log(bytes) / Math.log(inByte));
	const maxPow = Math.min(pow, sizes.length - 1);

	return `${Number.parseFloat((bytes / (inByte ** maxPow)).toFixed(dm))} ${
		sizes[maxPow]
	}`;
}
