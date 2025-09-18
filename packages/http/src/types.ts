import type { MaybePromise } from '@sodacore/core';
import type HttpContext from './context/http';

export type IWebSocketEvents = 'open' | 'close' | 'message' | 'drain';
export type IWebSocketEventListener = (...args: any[]) => Promise<void>;

export type IConfig = {
	port: number,
	host?: string,
	ssePath?: string, // [See docs for manual setup].
	builtInMiddlewares?: {
		cors?: boolean,
	},
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
	type: 'request' | 'server' | 'params' | 'query' | 'headers' | 'cookies' | 'body' | 'url' | 'method',
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
