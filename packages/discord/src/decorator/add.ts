import type { IRouterControllerMethodItem } from '../types';
import { Utils } from '@sodacore/di';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export function MessageContext(name: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('type', 'discord')(target, 'add.messagecontext', propertyKey);
		Utils.setMeta('unique', 'discord')(target, name, propertyKey);
		Utils.setMeta('builder', 'discord')(target, new ContextMenuCommandBuilder().setName(name).setType(ApplicationCommandType.Message), propertyKey);
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		methods.push({ key: String(propertyKey), unique: name, type: 'contextmenu', subType: 'message', auth: [] });
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function UserContext(name: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('type', 'discord')(target, 'add.usercontext', propertyKey);
		Utils.setMeta('unique', 'discord')(target, name, propertyKey);
		Utils.setMeta('builder', 'discord')(target, new ContextMenuCommandBuilder().setName(name).setType(ApplicationCommandType.User), propertyKey);
		const commands = Utils.getMeta<IRouterControllerMethodItem[]>('commands', 'discord')(target, undefined, []);
		commands.push({ key: String(propertyKey), type: 'contextmenu', subType: 'user', unique: name, auth: [] });
		Utils.setMeta('methods', 'discord')(target, commands);
	};
}
