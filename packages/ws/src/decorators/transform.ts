import type { ITransformFunction } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Transformers allow you to transform the returned data from a WebSocket
 * controller or controller method. You can assign them globally or per method, or define
 * a class transformer and apply different ones to different methods.
 * @param func Function that will be called with the context and response data.
 * @returns ClassDecorator
 * @default
 */
export default function Transform(func: ITransformFunction) {
	return (target: any, propertyKey?: string | symbol) => {
		const transformers = propertyKey
			? Utils.getMeta<ITransformFunction[]>('transformers', 'ws')(target, propertyKey, [])
			: Utils.getMeta<ITransformFunction[]>('transformers', 'ws')(target, undefined, []);
		transformers.push(func);
		propertyKey
			? Utils.setMeta('transformers', 'ws')(target, transformers, propertyKey)
			: Utils.setMeta('transformers', 'ws')(target, transformers);
	};
}
