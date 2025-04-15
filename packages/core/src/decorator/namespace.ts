import { Utils } from '@sodacore/di';

export default function Namespace(name: string) {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('namespace', 'script')(target, name ?? null);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('script');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
