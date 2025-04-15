import { Utils } from '@sodacore/di';

/**
 * Apply this decorator to a class so that when it autoloads
 * you can control the position, the autoloader sorts the modules
 * before initialising them, meaning if your module depends on another
 * you can control the order.
 * @param priority The priority of the autowire (default: 50).
 * @returns ClassDecorator
 * @default
 */
export default function Autoload(priority: number) {
	return (target: any) => {
		Utils.setMeta('order', 'autowire')(target, priority);
	};
}
