import { Utils } from '@sodacore/di';

/**
 * Apply this decorator to a class so that when it autoloads
 * it will automatically apply the `user:config` meta property
 * to your class, so you can resolve and use it at runtime.
 * @param config Any config you wish to pass to a class.
 * @returns ClassDecorator
 * @default
 */
export default function Configure(config: Record<string, any>) {
	return (target: any) => {
		Utils.setMeta('user', 'config')(target, config);
	};
}
