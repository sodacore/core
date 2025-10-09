import type { Server } from 'bun';
import type { ISsePacket } from '../types';
import { Inject } from '@sodacore/di';
import { v4 } from 'uuid';
import SseConnectionsProvider from '../provider/sse-connections';
import HttpContext from './http';

export default class SseContext extends HttpContext {
	@Inject() protected connections!: SseConnectionsProvider;
	protected id: string;
	protected encoder = new TextEncoder();
	protected controller!: { enqueue: (chunk: Uint8Array | undefined) => void, close: () => void };

	/**
	 * Initialise the request, defined by the http service
	 * automatically, and the SSE context will extend this
	 * by creating a SEE link and add to the SSE provider.
	 * @param request Request object.
	 * @param server Server object.
	 */
	public constructor(
		request: Request,
		server: Server,
	) {
		// Prepare the extending class.
		super(request, server);
		this.id = v4();
	}

	/**
	 * Will create a new response with a readable stream
	 * and link it all up to this context, this will allow
	 * the controller to send messages to the client, we
	 * will also automatically register with the sse provider.
	 * @param headers Extra headers to add to the response.
	 * @returns Response
	 */
	public getSseResponse(headers?: Record<string, string>) {

		// Get the abort signal.
		const { signal } = this.request;

		// Let's generate some cookie information.
		const maxAge = 60 * 60 * 24;

		// We should register the context with the connections handler.
		this.connections.addConnection(this.id, this);

		// Return a valid SSE response.
		return new Response(
			new ReadableStream({
				start: controller => {

					// Assign the controller.
					this.controller = controller;

					// Initially send a retry status and the first ping.
					this.sendRaw(':ping\n\n');
					this.sendRaw('retry: 3000\n\n');

					// Create a ping every 30 seconds.
					const interval = setInterval(() => {
						this.sendRaw(':ping\n\n');
					}, 30_000);

					// If we abort, clear interval and close the controller.
					signal.onabort = () => {
						clearInterval(interval);
						this.connections.removeConnection(this.id);
						controller.close();
					};
				},
			}),
			{
				headers: Object.assign({
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'X-Accel-Buffering': 'no',
					'Set-Cookie': `sodacoreId=${this.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge};`,
					'Connection': 'keep-alive',
				}, headers, this.responseHeaders),
			},
		);
	}

	public send(packet: ISsePacket): void {

		// Create the message parts.
		const messageParts = [];

		// Optionally add an ID.
		if (typeof packet.id !== 'undefined') {
			messageParts.push(`id: ${packet.id}`);
		}

		// Now add the data.
		messageParts.push(`data: ${JSON.stringify(packet.data)}`);

		// Create the string and send.
		this.sendRaw(`${messageParts.join('\n')}\n\n`);
	}

	public sendRaw(message: string): void {
		if (!this.controller) return;
		this.controller.enqueue(this.encoder.encode(message));
	}

	public close() {
		this.controller.close();
		this.connections.removeConnection(this.id);
	}
}
