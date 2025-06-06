import type { Socket } from 'bun';
import type { IScriptSocketData } from '../../types';

export default class SessionScriptHelper {
	public constructor(
		private socket: Socket<IScriptSocketData>,
	) {}

	public set(key: string, value: any) {
		this.socket.data.userDefined[key] = value;
	}

	public get<T = string>(key: string) {
		if (this.socket.data.userDefined[key] === undefined) return null;
		return this.socket.data.userDefined[key] as T;
	}

	public getAll() {
		return this.socket.data.userDefined;
	}

	public delete(key: string) {
		delete this.socket.data.userDefined[key];
	}

	public clear() {
		this.socket.data.userDefined = {};
	}

	public has(key: string) {
		return this.socket.data.userDefined[key] !== undefined;
	}

	public keys() {
		return Object.keys(this.socket.data.userDefined);
	}

	public values() {
		return Object.values(this.socket.data.userDefined);
	}
}
