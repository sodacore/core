import type { ServerWebSocket } from 'bun';
import type { IServerWsContext } from '../types';
import { Logger } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import { HttpContext } from '@sodacore/http';

export default class WsContext extends HttpContext {
	@Inject() private logger!: Logger;
	private data: Record<string, any> = {};

	public constructor(private socket: ServerWebSocket<IServerWsContext>) {
		const request = socket.data.httpContext.getRequest();
		const server = socket.data.httpContext.getServer();
		super(request, server);
	}

	public setData(data: Record<string, any>) {
		this.data = data;
	}

	public getId() {
		return String(this.getHeader('sec-websocket-key'));
	}

	public getRemoteAddress() {
		return this.socket.remoteAddress;
	}

	public send(command: string, context: Record<string, any> = {}) {
		this.socket.send(JSON.stringify({ command, context }));
	}

	public sendRaw(data: string) {
		this.socket.send(data);
	}

	public getData<T = Record<string, any>>() {
		return this.data as T;
	}

	public close(reason?: string, code?: number) {
		this.socket.close(code);
		if (reason) this.logger.warn(`[CONTEXT/WS]: Closed connection: "${this.getId()}" with reason: "${reason}"${code ? ` and code: "${code}".` : '.'}`);
	}
}
