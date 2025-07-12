import { Utils } from '@sodacore/di';

/**
 * Apply this decorator to any classes that are "services",
 * ensure you also extend the BaseService and implement the
 * IService interface.
 * @returns ClassDecorator
 * @default
 */
export default function Service() {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('service');
		Utils.setMeta('type', 'autowire')(target, types);
	};
}
