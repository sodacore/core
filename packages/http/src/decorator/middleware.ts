import type { IMiddleware } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Will define a class a middleware, make sure to
 * implement the IMiddleware interface.
 * @returns ClassDecorator
 */
export function GlobalMiddleware(config?: Record<string, any>) {
	return (target: any) => {
		Utils.setMeta('config', 'middleware')(target, config || {});
		Utils.setMeta('global', 'middleware')(target, true);
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('middleware');
		Utils.setMeta('type', 'autowire')(target, types);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('http');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function Middleware(config?: Record<string, any>) {
	return (target: any) => {
		Utils.setMeta('config', 'middleware')(target, config || {});
		Utils.setMeta('global', 'middleware')(target, false);
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('middleware');
		Utils.setMeta('type', 'autowire')(target, types);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('http');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function Use(...middlewares: any[]) {
	return (target: any, propertyKey?: string | symbol) => {
		const methodMiddlewares = propertyKey
			? Utils.getMeta<IMiddleware[]>('middlewares', 'http')(target, propertyKey, [])
			: Utils.getMeta<IMiddleware[]>('middlewares', 'http')(target, undefined, []);
		methodMiddlewares.push(...middlewares);
		propertyKey
			? Utils.setMeta('middlewares', 'http')(target, methodMiddlewares, propertyKey)
			: Utils.setMeta('middlewares', 'http')(target, methodMiddlewares);
	};
}
