import type { IControllerMetaMethodItem } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Will define a method as a route for the GET
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Get(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'GET', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the POST
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Post(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'POST', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the PUT
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Put(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'PUT', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the PATCH
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Patch(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'PATCH', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the DELETE
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Delete(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'DELETE', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the HEAD
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Head(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'HEAD', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}

/**
 * Will define a method as a route for the OPTIONS
 * REST method.
 * @param path Optional path.
 * @returns MethodDecorator
 */
export function Options(path?: string) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('allow', 'http')(target, propertyKey, 'http');
		const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(target, undefined, []);
		methods.push({ key: String(propertyKey), method: 'OPTIONS', path: path ?? '' });
		Utils.setMeta('methods', 'http')(target, methods);
	};
}
