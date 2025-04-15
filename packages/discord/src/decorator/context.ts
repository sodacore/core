import type { IControllerMethodArgItem } from '../types';
import { Utils } from '@sodacore/di';

export function Interaction() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'interaction' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function User() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'user' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function Guild() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'guild' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function Channel() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'channel' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function Client() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'client' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function Query() {
	return (target: any, key: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, key, []);
		args.push({ index, type: 'query' });
		Utils.setMeta('args', 'discord')(target, args, key);
	};
}

export function Option(name: string, sendAll = false) {
	return (target: any, propertyKey: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, propertyKey, []);
		args.push({ index, type: 'option', name, format: sendAll });
		Utils.setMeta('args', 'discord')(target, args, propertyKey);
	};
}

export function Field(name: string) {
	return (target: any, propertyKey: string | symbol, index: number) => {
		const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(target, propertyKey, []);
		args.push({ index, type: 'field', name });
		Utils.setMeta('args', 'discord')(target, args, propertyKey);
	};
}
