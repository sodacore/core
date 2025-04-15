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
		Utils.setMeta('type', 'autowire')(target, 'service');
	};
}
