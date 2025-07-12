import { Utils } from '@sodacore/di';

export default function Namespace(name: string) {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('controller');
		Utils.setMeta('type', 'autowire')(target, types);
		Utils.setMeta('namespace', 'script')(target, name ?? null);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('script');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
