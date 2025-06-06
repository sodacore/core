import type { IRouterControllerMethodItem } from '../types';
import { Utils } from '@sodacore/di';
import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';

export function MessageContext(name: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('type', 'discord')(target, 'add.messagecontext', propertyKey);
		Utils.setMeta('unique', 'discord')(target, name, propertyKey);
		Utils.setMeta('builder', 'discord')(target, new ContextMenuCommandBuilder().setName(name).setType(ApplicationCommandType.Message), propertyKey);

		// Get the defined methods or fallback to an empty array.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: 'contextmenu',
				subType: 'message',
				unique: name,
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].key = String(propertyKey);
		methods[methodIndex].unique = name;
		methods[methodIndex].type = 'contextmenu';
		methods[methodIndex].subType = 'message';

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function UserContext(name: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {
		Utils.setMeta('type', 'discord')(target, 'add.usercontext', propertyKey);
		Utils.setMeta('unique', 'discord')(target, name, propertyKey);
		Utils.setMeta('builder', 'discord')(target, new ContextMenuCommandBuilder().setName(name).setType(ApplicationCommandType.User), propertyKey);

		// Get the defined methods or fallback to an empty array.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));

		// If no method index, create a new item.
		if (methodIndex === -1) {
			methodIndex = methods.push({
				key: String(propertyKey),
				type: 'contextmenu',
				subType: 'user',
				unique: name,
				auth: [],
			}) - 1;
		}

		// Push the changes to this method.
		methods[methodIndex].key = String(propertyKey);
		methods[methodIndex].unique = name;
		methods[methodIndex].type = 'contextmenu';
		methods[methodIndex].subType = 'user';

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}
