import { Registry } from '@sodacore/registry';
import { getMeta, setMeta } from '../helper/decorator';

/**
 * Inject a dependency into a class under the given property,
 * it will use the class's name or the optional name to resolve
 * the property, you can also resolve anything from the Registry,
 * by passing the name parameter, including non-class based data.
 * @example `@Inject() public queue: QueueService;`
 * @example `@Inject('QueueService') public queue: QueueService;`
 * @param name An optional name to resolve instead of relying on class name.
 * @returns MethodDecorator
 */
export default function Inject(name?: string) {
	return (target: any, propertyKey: string | symbol) => {

		// Inject base information.
		setMeta('injections', 'di')(target, true);
		setMeta('injected', 'di')(target, true, propertyKey);

		// Get injection class and key.
		const injectClass = getMeta('design:type', undefined, true)(target, propertyKey);
		const injectKey = String(name ?? injectClass.name).replace(/\d+/, '');
		if (!injectKey) throw new Error(`Cannot inject ${String(propertyKey)} in ${target.constructor.name}, could not get the injection key.`);

		// Override the method getter.
		Object.defineProperty(target, propertyKey, {
			enumerable: true,
			configurable: true,
			get: () => {
				return Registry.get(injectKey);
			},
		});
	};
}
