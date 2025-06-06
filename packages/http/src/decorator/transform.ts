import type { ITransformFunction } from '../types';
import type { MaybePromise } from '@sodacore/core';
import type HttpContext from '../context/http';
import { Utils } from '@sodacore/di';

/**
 * Transformers allow you to transform the returned data from a controller
 * or controller method. You can assign them globally or per method, or define
 * a class transformer and apply different ones to different methods.
 *
 * The simple use case is for translations, but can be used for anything, you
 * will get the context and the response data, you can then modify the response
 * data and return it, or return a new object.
 * @param func Function that will be called with the context and response data.
 * @returns ClassDecorator
 * @default
 */
export default function Transform(func: (context: HttpContext, response: any) => MaybePromise<any>) {
	return (target: any, propertyKey?: string | symbol) => {
		const transformers = propertyKey
			? Utils.getMeta<ITransformFunction[]>('transformers', 'http')(target, propertyKey, [])
			: Utils.getMeta<ITransformFunction[]>('transformers', 'http')(target, undefined, []);
		transformers.push(func);
		propertyKey
			? Utils.setMeta('transformers', 'http')(target, transformers, propertyKey)
			: Utils.setMeta('transformers', 'http')(target, transformers);
	};
}
