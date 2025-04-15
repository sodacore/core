import type SseContext from '../context/sse';
import type { ISsePacket } from '../types';
import { Provide } from '@sodacore/di';

@Provide()
export default class SseConnectionsProvider {
	private connections = new Map<string, SseContext>();

	public addConnection(id: string, connection: SseContext) {
		this.connections.set(id, connection);
	}

	public removeConnection(id: string) {
		this.connections.delete(id);
	}

	public getConnection(id: string) {
		return this.connections.get(id);
	}

	public getConnections() {
		return this.connections;
	}

	public hasConnection(id: string) {
		return this.connections.has(id);
	}

	public getConnectionCount() {
		return this.connections.size;
	}

	public clearConnections() {
		for (const connection of this.connections.values()) {
			connection.close();
		}
		this.connections.clear();
	}

	public broadcast(packet: ISsePacket) {
		for (const connection of this.connections.values()) {
			connection.send(packet);
		}
	}

	public broadcastRaw(data: string) {
		for (const connection of this.connections.values()) {
			connection.sendRaw(data);
		}
	}

	public broadcastFor(id: string | string[], packet: ISsePacket) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of id) {
			const conn = this.connections.get(connection);
			if (conn) conn.send(packet);
		}
	}

	public broadcastRawFor(id: string | string[], data: string) {
		if (!Array.isArray(id)) id = [id];
		for (const connection of id) {
			const conn = this.connections.get(connection);
			if (conn) conn.sendRaw(data);
		}
	}

	public broadcastExcept(id: string | string[], packet: ISsePacket) {
		if (!Array.isArray(id)) id = [id];
		for (const [key, connection] of this.connections) {
			if (!id.includes(key)) connection.send(packet);
		}
	}

	public broadcastRawExcept(id: string | string[], data: string) {
		if (!Array.isArray(id)) id = [id];
		for (const [key, connection] of this.connections) {
			if (!id.includes(key)) connection.sendRaw(data);
		}
	}
}
