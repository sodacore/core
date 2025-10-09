import type { MaybePromise } from '@sodacore/core';
import type { HttpContext, IServerContext } from '@sodacore/http';
import type WsContext from './context/ws';

export type ITransformFunction = (context: HttpContext, response: any) => MaybePromise<any>;
export type IControllerMethod = (context: WsContext) => Promise<any>;

export type IConfig = {
	path?: string | string[], // Default: '/ws'.
	idleTimeout?: number, // Default: false.
	backpressureLimit?: number, // Default (1024 * 1024) 1MB.
	maxPayloadLength?: number, // Default: (1024 * 1024 * 16) 16MB
	closeOnBackpressureLimit?: boolean, // Default: false.
	publishToSelf?: boolean, // Default: false.
	perMessageDeflate?: boolean, // Default: false.
};

export type IServerWsContext = IServerContext & {
	httpContext: HttpContext,
};

export type IRoute = {
	transformers: ITransformFunction[],
	method: IControllerMethod,
};
