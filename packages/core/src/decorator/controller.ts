import { Utils } from '@sodacore/di';

/**
 * This decorator allows controllers to be defined as
 * thread controllers, where they can accept messages
 * from threads via IPC, and respond accordingly.
 *
 * All methods under a namespace will be prefixed with
 * the namespace, and the namespace will be used to
 * determine the IPC message type.
 *
 * You can send messages to a thread controller using
 * the thread's `this.dispatch('namespace/method', contextData);`
 * command.
 * @param namespace Controller namespace.
 * @returns ClassDecorator
 * @default
 */
export default function Controller(namespace: string) {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('controller');
		Utils.setMeta('type', 'autowire')(target, types);
		Utils.setMeta('namespace', 'thread')(target, namespace);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('thread');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
