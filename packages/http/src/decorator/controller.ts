import { Utils } from '@sodacore/di';

/**
 * Will add metadata to the class to define it's module status
 * and register the HTTP service access and an optional base path
 * that can be applied to all methods within this class.
 * @param path Optional base path.
 * @returns ClassDecorator
 * @default
 */
export default function Controller(path?: string) {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('path', 'http')(target, path);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('http');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
