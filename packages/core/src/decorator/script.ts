import { Utils } from '@sodacore/di';

export default function Script(name: string) {
	return (target: any, propertyKey: string | symbol) => {
		const methods = Utils.getMeta<Record<string, any>[]>('methods', 'script')(target, undefined, []);
		methods.push({ key: String(propertyKey), name });
		Utils.setMeta('methods', 'script')(target, methods);
	};
}
