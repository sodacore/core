import { Utils } from '@sodacore/di';

/**
 * Will define a class a middleware, make sure to
 * implement the IMiddleware interface.
 * @returns ClassDecorator
 */
export default function Middleware() {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('middleware');
		Utils.setMeta('type', 'autowire')(target, types);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('ws');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
