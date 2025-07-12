import { Utils } from '@sodacore/di';

/**
 * Apply this decorator to any classes you want to run as threads,
 * this means they will run an entirely different context (a new
 * child process) and will not share memory with the main process.
 *
 * Things to note:
 * 1. Context is not shared, so do not try to load from the Registry.
 * 2. The filename should be the filename of the file this class resides in.
 * 3. The filename may differ between compiled and uncompiled state, make sure.
 * 4. The flags are evaluated when the thread is created, therefore you can pull from the Registry.
 *
 * @param filename The filename of the file this class resides in.
 * @param flags A function that will run when the thread is created and convert the returned object to flags for the thread.
 * @returns ClassDecorator
 * @default
 * @deprecated - Use `@Worker` instead, this feature will change in an upcoming release.
 */
export default function Thread(
	filename: string,
	flags?: () => Record<string, string | number>,
) {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('thread');
		Utils.setMeta('type', 'autowire')(target, types);
		Utils.setMeta('filename', 'thread')(target, filename);
		Utils.setMeta('flags', 'thread')(target, flags);
	};
}
