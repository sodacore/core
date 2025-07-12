import { getMeta, setMeta } from '../helper/decorator';

/**
 * Provide the given class as a dependency, to be used with the
 * dependency injection logic. Also note that this class will be
 * initialised when the autowire module is called, this decorator
 * only applies metadata for injection.
 * @example `@Provide();`
 * @param name An optional name for the provider instead of relying on class name.
 * @returns ClassDecorator
 */
export default function Provide(name?: string) {
	return (target: any) => {
		const types = getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('provider');
		setMeta('type', 'autowire')(target, types);
		setMeta('name', 'di')(target, name ?? target.name);
	};
}
