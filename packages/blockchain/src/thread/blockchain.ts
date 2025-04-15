import type { IConfig } from '@sodacore/http';
import { BaseThread, Thread, Utils } from '@sodacore/core';
import { Registry } from '@sodacore/registry';
import { serve, type Server } from 'bun';

/**
 * This thread creates and manages a blockchain that will handle
 * and deal with transactions and blocks. This thread is persistent
 * and therefore will stick around through restarts.
 *
 * The design is to create a TCP server that will accept requests
 * and then pass them to the blockchain to be processed.
 * @thread Blockchain
 * @persistent
 */
@Thread(Utils.resolve(import.meta.filename), () => ({
	httpConfig: Registry.get('@http:config'),
}))
export default class BlochainThread extends BaseThread {
	private port!: number;
	private server!: Server;

	// This method is called on init of the application,
	// so let's add some logic to set the port to the normal
	// http port + 1.
	public async onInit() {
		const config = this.getArgv<IConfig>('httpConfig');
		this.port = (config?.port ?? 3000) + 1;
	}

	// This method will actually create the http server, but
	// then on request, it will accept the request, and pass
	// it to the main thread to be processed and expects a
	// html string in the return.
	public async onStart() {
		this.info(`Starting debug http server, on port: ${this.port}.`);
		this.server = serve({
			port: this.port,
			fetch: async request => {

				// Let's dispatch the event.
				const result = await this.dispatch<{ html: string }>('example:handle', {
					url: request.url,
				});

				// And then send a response.
				return new Response(result.html, {
					status: 200,
					headers: {
						'Content-Type': 'text/html',
					},
				});
			},
		});
	}

	// Triggered when the thread is stopped, let's just log
	// that we are shutting down the server, and stop it.
	public async onStop() {
		this.info('Shutting down debug http server.');
		this.server.stop();
	}
}
