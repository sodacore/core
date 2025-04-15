import type { IHookType } from '../types';
import { Utils } from '@sodacore/di';

/**
 * This decorator should be applied to any method that you want to
 * have run based on the given IHookType, this functionality allows
 * you to trigger methods, for setup, etc based on the application's
 * lifecycle hooks.
 * @param type IHookType
 * @returns MethodDecorator
 * @default
 */
export default function Hook(type: IHookType) {
	return (target: any, propertyKey: string | symbol) => {

		// Define the properties with hooks against the class.
		const hookedProperties = Utils.getMeta<(string | symbol)[]>('methods', 'hook')(target, undefined, []);
		hookedProperties.push(propertyKey);
		Utils.setMeta('methods', 'hook')(target, hookedProperties);

		// Now define the hook type against the method.
		Utils.setMeta('type', 'hook')(target, type, propertyKey);
	};
}
