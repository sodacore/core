import { Utils } from '@sodacore/di';

/**
 * This decorator should be used in combination with the @Worker
 * decorator where you want to expose a method to the worker, by
 * expose it means that when this method is called, it will be
 * proxied into the worker and the worker will actually do the work.
 * @returns MethodDecorator
 * @default
 */
export default function Expose() {
	return (target: any, propertyKey: string | symbol) => {
		const exposed = Utils.getMeta('exposed', 'worker')(target.constructor, undefined, []);
		exposed.push(propertyKey);
		Utils.setMeta('exposed', 'worker')(target.constructor, exposed);
	};
}
