import { Utils } from '@sodacore/di';
import { SharedSlashCommand } from 'discord.js';

export function Command(builder: SharedSlashCommand): ClassDecorator {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('type', 'discord')(target, 'command');
		Utils.setMeta('builder', 'discord')(target, builder);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('discord');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function ContextMenu(): ClassDecorator {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('type', 'discord')(target, 'contextmenu');
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('discord');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function Event(): ClassDecorator {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('type', 'discord')(target, 'event');
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('discord');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function Handler(): ClassDecorator {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'controller');
		Utils.setMeta('type', 'discord')(target, 'event');
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('discord');
		Utils.setMeta('services', 'controller')(target, services);
	};
}
