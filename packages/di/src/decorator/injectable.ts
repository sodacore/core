import { Registry } from '@sodacore/registry';

/**
 * The Injectable decorator marks a class as injectable and resolves its
 * dependencies from the registry when instantiated. Please note this is
 * an experimental feature and should be used with caution as the classes
 * in the Sodacore project are instantiated via the framework, so there
 * is a chance that the dependencies may not be available at the time
 * of instantiation.
 *
 * @experimental
 * @alpha
 * @returns ClassDecorator
 */
export default function Injectable() {
	return function<T extends { new(...args: any[]): any }>(target: T): T {
		const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target) || [];
		const newConstructor: any = function(...args: any[]) {
			if (args.length === 0 && paramTypes.length > 0) {
				args = paramTypes.map(Dependency => {
					if (!Registry.has(Dependency)) {
						Registry.set(Dependency, new Dependency());
					}
					return Registry.get(Dependency);
				});
			}
			/* eslint-disable-next-line new-cap */
			return new target(...args);
		};

		newConstructor.prototype = target.prototype;
		return newConstructor;
	};
}
