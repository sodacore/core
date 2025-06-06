import { Utils } from '@sodacore/di';

/**
 * Will define a class a middleware, make sure to
 * implement the IMiddleware interface.
 * @returns ClassDecorator
 */
export default function Middleware() {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'middleware');
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('ws');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
