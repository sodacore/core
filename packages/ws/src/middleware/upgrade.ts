import type { IConfig } from '../types';
import { Logger } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import { type HttpContext, type IMiddleware, Middleware } from '@sodacore/http';
import { v4 } from 'uuid';

@Middleware()
export default class UpgradeMiddleware implements IMiddleware {
	@Inject('@ws:config') private config!: IConfig;
	@Inject() private logger!: Logger;

	public async handle(context: HttpContext) {

		// Only execute if connection is attempting to upgrade.
		const hConnection = context.getHeader('connection');
		const hUpgrade = context.getHeader('upgrade');
		if (hConnection !== 'Upgrade' || hUpgrade !== 'websocket') return;

		// Check if the request matches one of the paths.
		const requestPath = context.getUrl().pathname;
		const paths = this.config.path ? Array.isArray(this.config.path) ? this.config.path : [this.config.path] : ['/ws'];
		if (!paths.includes(requestPath)) return new Response('Not Implemented', { status: 501 });

		// Let's get the request and server.
		const request = context.getRequest();
		const server = context.getServer();
		const id = v4();
		const maxAge = 60 * 60 * 24; // 24 hours.

		// Log the upgrade.
		this.logger.info(`[MIDDLEWARE]: Upgrading http connection to WebSocket for path: "${requestPath}"`);

		// Attempt to upgrade.
		const status = server.upgrade(request, {
			data: {
				httpContext: context,
			},
			headers: {
				'Set-Cookie': `sodacoreId=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge};`,
			},
		});

		// If the status was successful, prevent the http service from responding.
		if (status) return true;

		// If we failed, return a 500.
		return new Response('Internal Server Error', { status: 500 });
	}
}
