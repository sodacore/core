import type { IConfig, IGlobalMiddleware } from '../types';
import type HttpContext from '../context/http';
import { GlobalMiddleware } from '../decorator/middleware';
import { doesRouteMatch } from '../helper/paths';
import { Inject } from '@sodacore/di';
import { Logger } from '@sodacore/core';

@GlobalMiddleware()
export default class RateLimit implements IGlobalMiddleware {
	@Inject('@http:config') private config!: IConfig;
	@Inject() private logger!: Logger;
	private ips = new Map<string, number>();
	private options = {
		enabled: false,
		paths: null as string[] | null,
		limit: 5, // Default to 5 requests per second.
		minTimeBetweenRequests: 200, // Calculated value (ms).
	};

	public onInit() {

		// Handle boolean config for rate limit middleware.
		if (this.config.builtin?.rateLimitMiddleware === true) {
			this.options.enabled = true;
		}

		// Handle object config for rate limit middleware.
		if (typeof this.config.builtin?.rateLimitMiddleware === 'object') {
			this.options = {
				enabled: true,
				paths: this.config.builtin?.rateLimitMiddleware?.paths ?? null,
				limit: this.config.builtin?.rateLimitMiddleware?.limit ?? 5,
				minTimeBetweenRequests: 1000 / (this.config.builtin?.rateLimitMiddleware?.limit ?? 5),
			};
		}
	}

	public async supports(context: HttpContext) {

		// Check if enabled.
		if (!this.options.enabled) return false;

		// If no paths, allow all requests.
		if (this.options.paths === null) return true;

		// Check for matching paths.
		const requestPath = context.getUrl().pathname;
		for (const path of this.options.paths) {
			if (doesRouteMatch(path, requestPath)) {
				return true;
			}
		}
		return false;
	}

	public async handle(context: HttpContext) {

		// Check for invalid remote information.
		const remoteInformation = context.getRemoteAddressInformation();
		if (!remoteInformation) {
			return this.logger.warn('[HTTP]: Could not determine remote address for rate limiting.');
		}

		// Collect the information.
		// const requestPath = context.getUrl().pathname;
		const remoteAddress = remoteInformation.address;
		const remotePort = remoteInformation.port;
		const remoteIpv = remoteInformation.family;
		const now = Date.now();
		// const unique = `${remoteAddress}_${requestPath}`;
		const lastRequestTime = this.ips.get(remoteAddress) || 0;

		// Check if the request exceeds the rate limit.
		if (now - lastRequestTime < this.options.minTimeBetweenRequests) {
			this.logger.warn(`[HTTP]: Rate limit exceeded for IP. {${remoteAddress}} {${remotePort}} {${remoteIpv}}`);
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': `${Math.ceil((this.options.minTimeBetweenRequests - (now - lastRequestTime)) / 1000)}`,
				},
			});
		}

		// Update the last request time.
		this.ips.set(remoteAddress, now);
	}
}
