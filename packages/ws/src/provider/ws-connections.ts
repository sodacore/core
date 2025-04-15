import type WsContext from '../context/ws';
import { Provide } from '@sodacore/di';

@Provide()
export default class WsConnections {
	private connections = new Map<string, WsContext>();

	public addConnection(id: string, context: WsContext) {
		this.connections.set(id, context);
	}

	public removeConnection(id: string) {
		this.connections.delete(id);
	}

	public getConnection(id: string) {
		return this.connections.get(id);
	}

	public hasConnection(id: string) {
		return this.connections.has(id);
	}

	public getConnections() {
		return this.connections;
	}

	public getConnectionCount() {
		return this.connections.size;
	}

	public clearConnections(reason?: string) {
		for (const connection of this.connections.values()) {
			connection.close(reason);
		}
		this.connections.clear();
	}

	public broadcast(command: string, context: Record<string, any> = {}) {
		for (const connection of this.connections.values()) {
			connection.send(command, context);
		}
	}

	public broadcastRaw(data: string) {
		for (const connection of this.connections.values()) {
			connection.sendRaw(data);
		}
	}

	public broadcastFor(id: string | string[], command: string, context: Record<string, any> = {}) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of id) {
			const conn = this.connections.get(connection);
			if (conn) conn.send(command, context);
		}
	}

	public broadcastRawFor(id: string | string[], data: string) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of id) {
			const conn = this.connections.get(connection);
			if (conn) conn.sendRaw(data);
		}
	}

	public broadcastExcept(id: string | string[], command: string, context: Record<string, any> = {}) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of this.connections.values()) {
			if (!id.includes(connection.getId())) connection.send(command, context);
		}
	}

	public broadcastRawExcept(id: string | string[], data: string) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of this.connections.values()) {
			if (!id.includes(connection.getId())) connection.sendRaw(data);
		}
	}
}
