import { Utils } from '@sodacore/di';

/**
 * Apply this decorator to any classes that are to be used
 * as lookups for the i18n plugin, you can use the `supports`
 * method to specify which languages this lookup supports,
 * by default it supports all languages.
 * @returns ClassDecorator
 * @default
 */
export default function Lookup() {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('lookup');
		Utils.setMeta('type', 'autowire')(target, types);
	};
}
