import type { IRouterControllerMethodItem } from '../types';
import { Utils } from '@sodacore/di';

export function Command(): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.command', propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'command', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'command';
		methods[methodIndex].unique = false;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function SubCommand(subCommand: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.subcommand', propertyKey);
		Utils.setMeta('unique', 'discord')(target, subCommand, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'subcommand', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'subcommand';
		methods[methodIndex].unique = subCommand;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function Button(uniqueId: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.button', propertyKey);
		Utils.setMeta('unique', 'discord')(target, uniqueId, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'button', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'button';
		methods[methodIndex].unique = uniqueId;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function SelectMenu(uniqueId: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.selectmenu', propertyKey);
		Utils.setMeta('unique', 'discord')(target, uniqueId, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'selectmenu', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'selectmenu';
		methods[methodIndex].unique = uniqueId;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function Event(event: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.event', propertyKey);
		Utils.setMeta('unique', 'discord')(target, event, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'event', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'event';
		methods[methodIndex].unique = event;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function Autocomplete(name: string, subCommand?: string): MethodDecorator {
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.autocomplete', propertyKey);
		Utils.setMeta('unique', 'discord')(target, `${name}:${subCommand ?? ''}`, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'autocomplete', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'autocomplete';
		methods[methodIndex].unique = name;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}

export function ModalSubmit(unique: string): MethodDecorator {
	const className = undefined; // Possibly for better routing options, future?
	return (target: any, propertyKey: string | symbol) => {

		// Set the metadata.
		Utils.setMeta('type', 'discord')(target, 'on.modalsubmit', propertyKey);
		Utils.setMeta('unique', 'discord')(target, `${unique}:${className ?? ''}`, propertyKey);

		// Get the methods.
		const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(target, undefined, []);

		// Check if the method exists.
		let methodIndex = methods.findIndex((m: any) => m.key === String(propertyKey));
		if (methodIndex === -1) {
			methodIndex = methods.push({ key: String(propertyKey), unique: false, type: 'modalsubmit', auth: [] }) - 1;
		}

		// Set the method properties.
		methods[methodIndex].type = 'modalsubmit';
		methods[methodIndex].unique = unique;

		// Set the data back.
		Utils.setMeta('methods', 'discord')(target, methods);
	};
}
