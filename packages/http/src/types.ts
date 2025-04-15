import type HttpContext from './context/http';

export type IWebSocketEvents = 'open' | 'close' | 'message' | 'drain';
export type IWebSocketEventListener = (...args: any[]) => Promise<void>;

export type IConfig = {
	port: number,
	host?: string,
	ssePath?: string, // [See docs for manual setup].
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
};

export type IMethodRoutes = Record<string, IRoute>;
export type IRoutes = Record<string, IMethodRoutes>;

export type IControllerMethodArgItem = {
	type: 'request' | 'server' | 'params' | 'query' | 'headers' | 'cookies' | 'body' | 'url' | 'method',
	index: number,
	name?: string,
	format?: string,
};

export interface IMiddleware {
	handle: (context: HttpContext) => Promise<Response | boolean | void>,
}
