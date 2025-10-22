import type { IControllerMethodArgItem } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Will inject the request object into the given parameter
 * at the given index.
 * @type Request
 * @returns ParameterDecorator
 */
export function Request() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'request' });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the server object into the given parameter
 * at the given index.
 * @type Server<IServerContext>
 * @returns ParameterDecorator
 */
export function Server() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'server' });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the URL params object or specific parameter
 * into the given parameter at the given index.
 * @type string | Record<string, any>
 * @param name Name of the parameter to inject. [optional]
 * @returns ParameterDecorator
 */
export function Params(name?: string) {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'params', name });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the query object or specific query parameter
 * into the given parameter at the given index.
 * @type string | Record<string, any>
 * @param name Name of the parameter to inject. [optional]
 * @returns ParameterDecorator
 */
export function Query(name?: string) {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'query', name });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the headers object or specific header
 * into the given parameter at the given index.
 * @type Record<string, string> | string
 * @param name Name of the parameter to inject. [optional]
 * @returns ParameterDecorator
 */
export function Headers(name?: string) {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'headers', name });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the cookies object or specific cookie
 * into the given parameter at the given index.
 * @type string | Record<string, string>
 * @param name Name of the parameter to inject. [optional]
 * @returns ParameterDecorator
 */
export function Cookies(name?: string) {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'cookies', name });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the body object, by default will attempt
 * to convert the body to JSON, but can be set to raw
 * to return the raw text.
 * @type any | Record<string, any>
 * @param format Format of the body, default is 'json'.
 * @returns ParameterDecorator
 */
export function Body(format: 'json' | 'raw' = 'json') {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'body', format });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the URL object instance of the given
 * request.
 * @type URL
 * @returns ParameterDecorator
 */
export function Url() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'url' });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will return the method used to access the endpoint,
 * used for methods that service many routes.
 * @type string
 * @returns ParameterDecorator
 */
export function Method() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'method' });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the files array or specific file
 * into the given parameter at the given index.
 * @param name Name of the file to inject. [optional]
 * @type File | File[]
 * @returns ParameterDecorator
 */
export function Files(name?: string) {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'files', name });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}

/**
 * Will inject the HttpContext instance
 * into the given parameter at the given index.
 * @type HttpContext
 * @returns ParameterDecorator
 */
export function Context() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(target, key, []);
		args.push({ index, type: 'context' });
		Utils.setMeta('args', 'http')(target, args, key);
	};
}
