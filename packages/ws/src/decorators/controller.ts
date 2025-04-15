import { Utils } from '@sodacore/di';

/**
 * Will add metadata to the class to define it's module status
 * and register the WS service access and the required namespace
 * that can then be used to trigger the controller.
 * @param namespace Controller namespace.
 * @returns ClassDecorator
 * @default
 */
export default function Controller(namespace: string) {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('namespace', 'ws')(target, namespace);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('ws');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
