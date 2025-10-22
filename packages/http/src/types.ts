import type { MaybePromise } from '@sodacore/core';
import type { TLSOptions } from 'bun';
import type HttpContext from './context/http';

export type IWebSocketEvents = 'open' | 'close' | 'message' | 'drain';
export type IWebSocketEventListener = (...args: any[]) => Promise<void>;

export type IConfig = {
	port: number,
	host?: string,
	ssePath?: string, // [See docs for manual setup].
	httpOptions?: {
		maxRequestBodySize?: number, // Default: 128MB.
		idleTimeout?: number, // Default: 10s.
		ipv6Only?: boolean, // Default: false.
		reusePort?: boolean, // Default: false (used for load-balancing).
		unixSocketPath?: string, // Default: undefined (used for socket-based servers).
		tls?: TLSOptions,
	},
	builtin?: {
		corsMiddleware?: boolean,
	},
};

export type IWsConfig = {
	idleTimeout?: number, // Default: false.
	backpressureLimit?: number, // Default (1024 * 1024) 1MB.
	maxPayloadLength?: number, // Default: (1024 * 1024 * 16) 16MB
	closeOnBackpressureLimit?: boolean, // Default: false.
	publishToSelf?: boolean, // Default: false.
	perMessageDeflate?: boolean, // Default: false.
};

export type IControllerMetaMethodItem = {
	key: string,
	method: string,
	path: string,
};

export type ISsePacket = {
	id?: string,
	data: Record<string, any>,
};

export type IServerContext = {
	request: Request,
	uniqueId: string,
	channels: string[],
	httpContext?: HttpContext,
};

export type IRoute = {
	methodName: string,
	controller: any,
	middlewares: IMiddleware[],
	transformers: ((context: HttpContext, response: any) => Promise<any>)[],
};

export type IMethodRoutes = Record<string, IRoute>;
export type IRoutes = Record<string, IMethodRoutes>;

export type IControllerMethodArgItem = {
	type: 'request' | 'server' | 'params' | 'query' | 'headers' | 'cookies' | 'body' | 'url' | 'method' | 'files' | 'context',
	index: number,
	name?: string,
	format?: string,
};

export interface ITranslationService {
	hasTranslations: () => boolean,
	translate: (query: string, options: { lang: string, country?: string }) => string,
}

export type ITransformFunction = (context: HttpContext, response: any) => MaybePromise<any>;

export interface IGlobalMiddleware<ConfigType = Record<string, any>, ContextType = HttpContext> {
	config?: ConfigType,
	supports?: (context: ContextType) => Promise<Response | boolean | void>,
	handle: (context: ContextType) => Promise<Response | boolean | void>,
};

export type IMiddleware = (context: HttpContext) => MaybePromise<Response | boolean | void>;
