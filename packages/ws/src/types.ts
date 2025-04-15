import type { HttpContext, IServerContext } from '@sodacore/http';

export type IConfig = {
	port?: number, // Default: 8080 (or http port).
	path?: string | string[], // Default: '/ws'.
	keepAlive?: boolean, // Default: true.
	idleTimeout?: number, // Default: false.
	backpressureLimit?: number, // Default (1024 * 1024) 1MB.
	maxPayloadLength?: number, // Default: (1024 * 1024 * 16) 16MB
	closeOnBackpressureLimit?: boolean, // Default: false.
	publishToSelf?: boolean, // Default: false.
	perMessageDeflate?: unknown, // @todo - figure out types for this - Default: false.
};

export type IServerWsContext = IServerContext & {
	httpContext: HttpContext,
};
