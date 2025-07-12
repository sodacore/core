import type { IDiscordOptionsCommand, IDiscordOptionsExtended, IDiscordOptionsGeneric, IDiscordOptionsGroup, IDiscordOptionsString, IDiscordOptionsSubCommand, IRouterControllerMethodItem } from '../types';
import { Utils } from '@sodacore/di';

export function SlashCommand(options: IDiscordOptionsCommand): ClassDecorator {
	return (target: any) => {
		const types = Utils.getMeta<string[]>('type', 'autowire')(target, undefined, []);
		types.push('controller');
		Utils.setMeta('type', 'autowire')(target, types);
		Utils.setMeta('type', 'discord')(target, 'command');
		Utils.setMeta('builder', 'discord')(target, null);
		Utils.setMeta('options', 'discord')(target, options, undefined);
		const services = Utils.getMeta<string[]>('services', 'controller')(target, undefined, []);
		services.push('discord');
		Utils.setMeta('services', 'controller')(target, services);
	};
}

export function SubCommand(options: IDiscordOptionsSubCommand) {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('subcommand', 'discord')(target, options, propertyKey);
		Utils.setMeta('type', 'discord')(target, 'on.subcommand', propertyKey);
		Utils.setMeta('unique', 'discord')(target, options.name, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'subcommand', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'subcommand';
		methods[methodIndex].unique = options.name;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function AttachmentOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'attachment', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function BooleanOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'boolean', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function ChannelOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'channel', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function MentionableOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'mentionable', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function RoleOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'role', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function UserOption(options: IDiscordOptionsGeneric) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'user', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function NumberOption(options: IDiscordOptionsExtended) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'number', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function IntegerOption(options: IDiscordOptionsExtended) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'integer', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}

export function StringOption(options: IDiscordOptionsString) {
	return (target: any, propertyKey?: string | symbol) => {
		const scOptions = Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(target, propertyKey, []);
		scOptions.push({ type: 'string', options });
		Utils.setMeta('options', 'discord')(target, scOptions, propertyKey);
	};
}
