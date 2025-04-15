import type { IConfig, IControllerMetaMethodItem, IControllerMethodArgItem, IMiddleware, IRoutes, IServerContext, IWebSocketEventListener, IWebSocketEvents } from '../types';
import { BaseService, Utils as CoreUtils, Events, Service } from '@sodacore/core';
import { Inject, Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { type Serve, serve, type Server } from 'bun';
import HttpContext from '../context/http';
import SseContext from '../context/sse';
import { doesRouteMatch, getRouteParams, toResponse } from '../helper/utils';
import SseConnectionsProvider from '../provider/sse-connections';

/**
 * The HTTP service, will initialise the server and handle requests,
 * creating context objects, collect all the controllers and middleware
 * and then dispatch the request to the correct controller method.
 * @class HttpService
 * @extends {BaseService}
 * @default
 */
@Service()
export default class HttpService extends BaseService {
	@Inject('@http:config') private config!: IConfig;
	@Inject() private events!: Events;
	@Inject() private connections!: SseConnectionsProvider;
	private wsListeners = new Map<IWebSocketEvents, Set<IWebSocketEventListener>>();
	private server!: Server;
	private serverConfig!: Serve<IServerContext>;
	private controllers: any[] = [];
	private middleware: IMiddleware[] = [];
	private routes: IRoutes = {};

	/**
	 * Will initialise the HTTP service, setting up the server config
	 * and then looking for controllers and middleware to register.
	 * @returns void
	 * @async
	 */
	public async init() {

		// Setup the server config.
		this.setupServerConfig();

		// Let's look for controllers/middleware.
		const modules = Registry.all();
		for (const module of modules) {

			// Define the variables
			const type = Utils.getMeta('type', 'autowire')(module.constructor);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);

			// Check for valid type and service it is for.
			if (!type || !services.includes('http')) continue;

			// If a middleware type.
			if (type === 'middleware') {
				this.middleware.push(module);
				continue;
			}

			// If a controller type.
			if (type === 'controller') {
				this.controllers.push(module);
				continue;
			}
		}

		// Now loop the controllers.
		this.controllers.forEach(controller => {

			// Get the base path and methods.
			const basePath = Utils.getMeta<string>('path', 'http')(controller.constructor, undefined, '[/]');
			const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(controller, undefined, []);

			// Loop the methods.
			methods.forEach(method => {

				// Define the full path.
				const methodPath = Utils.getMeta<string>('path', 'http')(controller, method.key, method.path);
				const path = CoreUtils.resolve(basePath, methodPath);
				const httpMethod = method.method.toUpperCase();

				// Check if a route for that method exists.
				if (!this.routes[httpMethod]) this.routes[httpMethod] = {};
				this.routes[httpMethod][path] = {
					methodName: method.key,
					controller,
				};
			});
		});

		// Get the route count.
		const routeCount = Object.keys(this.routes).reduce((count, key) => count + Object.keys(this.routes[key]).length, 0);

		// Log the route count.
		this.logger.info(`[PLUGIN/HTTP]: Registered ${routeCount} routes.`);
	}

	/**
	 * Will start the HTTP service, creating the server and then
	 * starting it up to listen for incoming requests.
	 * @returns void
	 * @async
	 */
	public async start() {
		this.server = serve<IServerContext, any>(this.serverConfig);
		this.logger.info(`[PLUGIN/HTTP]: Started HTTP service on port: ${this.config.port ?? 8080}.`);
	}

	/**
	 * Will stop the HTTP service, closing the server and stopping
	 * it from listening for incoming requests.
	 * @returns void
	 * @async
	 */
	public async stop() {
		this.connections.clearConnections();
		this.server.stop();
	}

	/**
	 * Will attach a listener to the given websocket event, so that
	 * another service could actually handle the event.
	 * @param event The event to listen for.
	 * @param listener The listener to attach.
	 */
	public addListener(event: IWebSocketEvents, listener: IWebSocketEventListener) {
		if (!this.wsListeners.has(event)) this.wsListeners.set(event, new Set());
		this.wsListeners.get(event)?.add(listener);
	}

	/**
	 * Will remove a listener from the given websocket event.
	 * @param event The event to remove.
	 * @param listener The listener to remove.
	 */
	public removeListener(event: IWebSocketEvents, listener: IWebSocketEventListener) {
		this.wsListeners.get(event)?.delete(listener);
	}

	/**
	 * Will setup the server config, setting the port and fetch
	 * method to handle incoming requests.
	 * @private
	 */
	private setupServerConfig() {
		this.serverConfig = {
			hostname: this.config.host ?? undefined,
			port: this.config.port ?? 8080,
			fetch: async (request, server) => {

				// Define basic information.
				const requestUrl = request.url;
				const requestMethod = request.method.toUpperCase();

				// Notify console.
				this.logger.info(`[PLUGIN/HTTP]: Received a ${requestMethod} request for: ${requestUrl}.`);

				// Handle the request.
				const response = await this.handleRequest.bind(this)(request, server);

				// Return the response.
				return response;
			},
			websocket: {
				open: socket => {
					const listeners = this.wsListeners.get('open');
					if (listeners) listeners.forEach(listener => listener(socket));
				},
				close: (socket, code, reason) => {
					const listeners = this.wsListeners.get('close');
					if (listeners) listeners.forEach(listener => listener(socket, code, reason));
				},
				drain: socket => {
					const listeners = this.wsListeners.get('drain');
					if (listeners) listeners.forEach(listener => listener(socket));
				},
				message: (socket, message) => {
					const listeners = this.wsListeners.get('message');
					if (listeners) listeners.forEach(listener => listener(socket, message));
				},
			},
		};
	}

	/**
	 * Will set a config value for the HTTP service by default
	 * or to the WebSocket config if specified.
	 * @param key The config key.
	 * @param value The value to set.
	 * @param forWs For WebSocket, defaults to the root config.
	 */
	public setConfig(key: string, value: any, forWs = false) {
		if (forWs) (<any> this.serverConfig).websocket[key] = value;
		else (<any> this.serverConfig)[key] = value;
	}

	/**
	 * Will handle the incoming request, creating a HTTP context
	 * object and then running any middleware before dispatching
	 * the request to the correct controller method.
	 * @param request The incoming request.
	 * @param server The server instance.
	 * @returns Response
	 * @private
	 * @async
	 */
	private async handleRequest(request: Request, server: Server) {

		// Create our http context early.
		const context = new HttpContext(request, server);

		// Dispatch a http request event.
		this.events.dispatch('httpRequest', { request, server, context });

		// Let's run any middleware.
		for (const middleware of this.middleware) {

			// Execute the middleware.
			try {
				const result = await middleware.handle.bind(middleware)(context);

				// If the result is a response, return it.
				if (result instanceof Response) {
					return result;
				};

				// Check if the result is false, if so return a 401.
				if (result === false) return new Response(undefined, { status: 401 });

			} catch (err) {

				// Throw an error about middleware failing.
				this.logger.error(`[PLUGIN/HTTP]: Failed middleware: ${middleware.constructor.name}, reason: ${(err as Error).message}.`);
				return new Response(undefined, { status: 500 });
			}
		}

		// Handle HTTP request.
		return await this.dispatch(context);
	}

	/**
	 * Will dispatch the request to the correct controller method,
	 * matching the path and method to the controller method.
	 * @param context The HTTP context object.
	 * @returns Response
	 * @private
	 * @async
	 */
	private async dispatch(context: HttpContext) {

		// Define the URL.
		const url = context.getUrl();
		const method = context.getRequest().method.toUpperCase();
		const path = url.pathname;

		// Check for the SSE path.
		if (this.config.ssePath && path === this.config.ssePath) {

			// Check if the user is requesting SSE.
			const accept = context.getRequest().headers.get('Accept');
			if (!accept || !accept.includes('text/event-stream')) return new Response(undefined, { status: 404 });

			// Otherwise, handle the SSE request.
			this.logger.info(`[PLUGIN/HTTP]: Upgrading connection to SSE, for path: "${path}".`);
			return this.handleSseRequest(context);
		}

		// Get the routes for that method.
		const routes = this.routes[method];

		// Loop routes and match.
		const matchedPath = Object.keys(routes).find(routePath => {
			return doesRouteMatch(routePath, path);
		});

		// If no matched path, return 404.
		if (!matchedPath) return new Response(undefined, { status: 404 });

		// Validate the method is a function.
		const handler = routes[matchedPath];
		if (!handler) return new Response(undefined, { status: 404 });
		if (typeof handler.controller[handler.methodName] !== 'function') return new Response(undefined, { status: 500 });

		// Get the param names from the route url and match them to the given path and then convert to an object.
		const params = getRouteParams(matchedPath, path);

		// Execute the handler.
		try {

			// Available: Request, Server, Params, Query, Body, Headers, Cookies, Url, Method
			const args = Utils.getMeta<IControllerMethodArgItem[]>('args', 'http')(handler.controller, handler.methodName, []);
			const paramTypes = Reflect.getMetadata('design:paramtypes', handler.controller, handler.methodName);
			const paramCount = paramTypes.length;

			// Create some params, and then loop and apply.
			const functionArguments = [];
			for (let i = 0; i < paramCount; i++) {
				functionArguments.push(this.getMethodArgument(i, args, context, params));
			}

			// Run the method and return the response.
			const result = await handler.controller[handler.methodName].bind(handler.controller)(...functionArguments, context);
			return toResponse(result);

		} catch (err) {

			// Log the error, and return a 500.
			this.logger.error(`[PLUGIN/HTTP]: Failed GET: ${matchedPath}, with controller: ${handler.controller.constructor.name} and method: ${handler.methodName}, reason: ${(err as Error).message}.`);
			return new Response(undefined, { status: 500 });
		}
	}

	private handleSseRequest(context: HttpContext) {

		// Create an SSE context.
		const sseContext = new SseContext(context.getRequest(), context.getServer());

		// Dispatch an sse request event.
		this.events.dispatch('sseRequest', {
			request: context.getRequest(),
			server: context.getServer(),
			context: sseContext,
		});

		// Let's create the SSE link.
		return sseContext.getSseResponse();
	}

	/**
	 * Will get the method argument based on the index and the
	 * arguments passed to the method.
	 * @param index The index of the argument.
	 * @param args The arguments passed to the method.
	 * @param context The HTTP context object.
	 * @param params The route params.
	 * @returns any
	 * @private
	 */
	private getMethodArgument(index: number, args: IControllerMethodArgItem[], context: HttpContext, params: Record<string, any>) {

		// Check for args.
		const arg = args.find(arg => arg.index === index);
		if (!arg) return undefined;

		// Parse the cookies.
		const cookies = context.getCookies();

		// Switch on the type.
		switch (arg.type) {
			case 'request': return context.getRequest();
			case 'server': return context.getServer();
			case 'params': return arg.name ? this.asNumber(params[arg.name]) : params;
			case 'query': return arg.name ? this.asNumber(context.getUrl().searchParams.get(arg.name)) : context.getUrl().searchParams;
			case 'headers': return arg.name ? context.getRequest().headers.get(arg.name) : context.getRequest().headers;
			case 'cookies': return arg.name ? cookies.get(arg.name) : cookies;
			case 'body': return context.getRequest().body;
			case 'url': return context.getUrl();
			case 'method': return context.getRequest().method;
		}
	}

	/**
	 * Will convert the value to a number if it is a number.
	 * @param value The value to convert.
	 * @returns any
	 * @private
	 */
	private asNumber(value: any) {
		const number = Number(value);
		return Number.isNaN(number) ? value : number;
	}
}
