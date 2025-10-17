import type { IConfig } from '../types';
import { Logger } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import { GlobalMiddleware, type HttpContext, type IGlobalMiddleware } from '@sodacore/http';
import { v4 } from 'uuid';

@GlobalMiddleware()
export default class UpgradeMiddleware implements IGlobalMiddleware {
	@Inject('@ws:config') private wsConfig!: IConfig;
	@Inject() private logger!: Logger;

	public async supports(context: HttpContext) {

		// Check if the request is an upgrade request.
		const hConnection = context.getHeader('connection');
		const hUpgrade = context.getHeader('upgrade');
		if (hConnection !== 'Upgrade' || hUpgrade !== 'websocket') return false;

		// Check if the request matches one of the paths.
		const requestPath = context.getUrl().pathname;
		const paths = this.wsConfig.path ? Array.isArray(this.wsConfig.path) ? this.wsConfig.path : [this.wsConfig.path] : ['/ws'];
		if (!paths.includes(requestPath)) return false;

		// Return true if the request is a valid upgrade request.
		return true;
	}

	public async handle(context: HttpContext) {

		// Let's get the request and server.
		const request = context.getRequest();
		const server = context.getServer();
		const id = v4();
		const maxAge = 60 * 60 * 24; // 24 hours.

		// Log the upgrade.
		this.logger.info(`[MIDDLEWARE]: Upgrading http connection to WebSocket for path: "${context.getUrl().pathname}"`);

		// Attempt to upgrade.
		const status = server.upgrade(request, {
			data: {
				request,
				uniqueId: v4(),
				channels: [],
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
