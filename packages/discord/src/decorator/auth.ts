import type { IAuthFunction, IAuthFunctionGuildMember, IAuthFunctionUser, IRouterControllerMethodItem } from '../types';
import { GuildMember as DiscordGuildMember, User as DiscordUser } from 'discord.js';
import { Utils } from '@sodacore/di';

export function HasRole(roleId: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].auth.push({
			wants: 'guildmember',
			callback: (member: DiscordGuildMember | DiscordUser) => {
				if (member instanceof DiscordGuildMember) {
					return member.roles.cache.has(roleId);
				}
				return false;
			},
		});

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function HasRoles(roleIds: string[]): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].auth.push({
			wants: 'guildmember',
			callback: (member: DiscordGuildMember | DiscordUser) => {
				if (member instanceof DiscordGuildMember) {
					return roleIds.every(r => member.roles.cache.has(r));
				}
				return false;
			},
		});

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function UserCustom(callback: IAuthFunctionUser): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].auth.push({ wants: 'user', callback: callback as IAuthFunction });

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function GuildMemberCustom(callback: IAuthFunctionGuildMember): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method
		methods[methodIndex].auth.push({ wants: 'guildmember', callback: callback as IAuthFunction });

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function IsDirectMessage(): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].auth.push({
			wants: 'guildmember',
			callback: (member: DiscordGuildMember | DiscordUser) => member instanceof DiscordUser,
		});

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function IsGuildMessage(): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Collect the methods and check for a method index.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: '',
				unique: '',
				auth: [],
			}) - 1;
		}

		// Push the changes to this method
		methods[methodIndex].auth.push({
			wants: 'guildmember',
			callback: (member: DiscordGuildMember | DiscordUser) => member instanceof DiscordGuildMember,
		});

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}
