import { Utils } from '@sodacore/di';

/**
 * This decorator is used by the WS package to expose a method
 * within a controller for the WebSocket to be called, a command
 * is a format of: `namespace/methodName`.
 * @returns MethodDecorator
 * @default
 */
export default function Expose() {
	return (target: any, propertyKey: string | symbol) => {
		const exposed = Utils.getMeta('exposed', 'ws')(target.constructor, undefined, []);
		exposed.push(propertyKey);
		Utils.setMeta('exposed', 'ws')(target.constructor, exposed);
	};
}
