import type { IConfig, IControllerMetaMethodItem, IControllerMethodArgItem, IGlobalMiddleware, IMiddleware, IRoutes, IServerContext, IWebSocketEventListener, IWebSocketEvents, IWsConfig } from '../types';
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
	@Inject('@ws:config') private wsConfig!: IWsConfig;
	@Inject() private events!: Events;
	@Inject() private connections!: SseConnectionsProvider;
	private wsListeners = new Map<IWebSocketEvents, Set<IWebSocketEventListener>>();
	private server!: Server;
	private serverConfig!: Serve<IServerContext>;
	private controllers: any[] = [];
	private middleware: IMiddleware[] = [];
	private globalMiddleware: IGlobalMiddleware[] = [];
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
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);

			// Check for valid type and service it is for.
			if (types.length === 0 || !services.includes('http')) continue;

			// If a middleware type.
			if (types.includes('middleware')) {
				const isGlobal = Utils.getMeta<boolean>('global', 'middleware')(module.constructor, undefined, false);
				this[isGlobal ? 'globalMiddleware' : 'middleware'].push(module);
			}

			// If a controller type.
			if (types.includes('controller')) {
				this.controllers.push(module);
			}
		}

		// Now loop the controllers.
		this.controllers.forEach(controller => {

			// Get the base path and methods.
			const basePath = Utils.getMeta<string>('path', 'http')(controller.constructor, undefined, '[/]');
			const methods = Utils.getMeta<IControllerMetaMethodItem[]>('methods', 'http')(controller, undefined, []);
			const controllerMiddlewares = Utils.getMeta<IMiddleware[]>('middlewares', 'http')(controller.constructor, undefined, []);
			const controllerTransformers = Utils.getMeta<((context: HttpContext, response: any) => Promise<any>)[]>('transformers', 'http')(controller.constructor, undefined, []);

			// Loop the methods.
			methods.forEach(method => {

				// Define the full path.
				const methodPath = Utils.getMeta<string>('path', 'http')(controller, method.key, method.path);
				const path = CoreUtils.resolve(basePath, methodPath);
				const httpMethod = method.method.toUpperCase();
				const methodMiddlewares = Utils.getMeta<IMiddleware[]>('middlewares', 'http')(controller, method.key, []);
				const methodTransformers = Utils.getMeta<((context: HttpContext, response: any) => Promise<any>)[]>('transformers', 'http')(controller, method.key, []);

				// Check if a route for that method exists.
				if (!this.routes[httpMethod]) this.routes[httpMethod] = {};
				this.routes[httpMethod][path] = {
					methodName: method.key,
					controller,
					middlewares: [...controllerMiddlewares, ...methodMiddlewares],
					transformers: [...methodTransformers, ...controllerTransformers],
				};
			});
		});

		// Get the route count.
		const routeCount = Object.keys(this.routes).reduce((count, key) => count + Object.keys(this.routes[key]).length, 0);

		// Log the route count.
		this.logger.info(`[HTTP]: Registered ${routeCount} routes.`);
	}

	/**
	 * Will start the HTTP service, creating the server and then
	 * starting it up to listen for incoming requests.
	 * @returns void
	 * @async
	 */
	public async start() {
		this.server = serve<IServerContext, any>(this.serverConfig);
		this.logger.info(`[HTTP]: Started HTTP service on port: ${this.config.port ?? 8080}.`);
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
			maxRequestBodySize: this.config.httpOptions?.maxRequestBodySize,
			idleTimeout: this.config.httpOptions?.idleTimeout,
			ipv6Only: this.config.httpOptions?.ipv6Only,
			reusePort: this.config.httpOptions?.reusePort,
			tls: this.config.httpOptions?.tls,
			unix: this.config.httpOptions?.unixSocketPath,
			fetch: async (request, server) => {

				// Define basic information.
				const requestUrl = request.url;
				const requestMethod = request.method.toUpperCase();
				const remoteAddress = server.requestIP(request);

				// Notify console.
				this.logger.info(`[HTTP]: ${requestMethod} ${requestUrl} {${remoteAddress?.address}} {${remoteAddress?.port}} {${remoteAddress?.family}}`);

				// Handle the request.
				const response = await this.handleRequest.bind(this)(request, server);

				// Return the response.
				return response;
			},
			websocket: {
				perMessageDeflate: this.wsConfig.perMessageDeflate,
				idleTimeout: this.wsConfig.idleTimeout,
				backpressureLimit: this.wsConfig.backpressureLimit,
				maxPayloadLength: this.wsConfig.maxPayloadLength,
				closeOnBackpressureLimit: this.wsConfig.closeOnBackpressureLimit,
				publishToSelf: this.wsConfig.publishToSelf,
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
		for (const middleware of this.globalMiddleware) {

			// Execute the middleware.
			try {

				// Check if the middleware has a supports method, and then run it.
				if (middleware.supports) {
					const doesSupport = await middleware.supports(context);
					if (!doesSupport) continue;
				}

				// Execute the middleware handle method.
				const result = await middleware.handle.bind(middleware)(context);

				// If the result is a response, return it.
				if (result instanceof Response) {
					return result;
				};

				// Check if the result is false, if so return a 401.
				if (result === false) return new Response(undefined, { status: 401, headers: context.getResponseHeaders() });

			} catch (err) {

				// Throw an error about middleware failing.
				this.logger.error(`[HTTP]: Failed middleware: ${middleware.constructor.name}, reason: ${(err as Error).message}.`);
				return new Response(undefined, { status: 500, headers: context.getResponseHeaders() });
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
			if (!accept || !accept.includes('text/event-stream')) return new Response(undefined, { status: 404, headers: context.getResponseHeaders() });

			// Otherwise, handle the SSE request.
			this.logger.info(`[HTTP]: Upgrading connection to SSE, for path: "${path}".`);
			return this.handleSseRequest(context);
		}

		// Get the routes for that method.
		const routes = this.routes[method] ?? {};

		// Loop routes and match.
		const matchedPath = Object.keys(routes).find(routePath => {
			return doesRouteMatch(routePath, path);
		});

		// If no matched path, return 404.
		if (!matchedPath) return new Response(undefined, { status: 404, headers: context.getResponseHeaders() });

		// Validate the method is a function.
		const handler = routes[matchedPath];
		if (!handler) return new Response(undefined, { status: 404, headers: context.getResponseHeaders() });
		if (typeof handler.controller[handler.methodName] !== 'function') return new Response(undefined, { status: 500, headers: context.getResponseHeaders() });

		// Execute any controller/method middlewares.
		for (const middleware of handler.middlewares) {
			try {
				await middleware(context);
			} catch (err) {
				this.logger.error(`[HTTP]: Failed middleware: ${middleware.constructor.name}, reason: ${(err as Error).message}.`);
				return new Response(undefined, { status: 500, headers: context.getResponseHeaders() });
			}
		}

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
				functionArguments.push(await this.getMethodArgument(i, args, context, params));
			}

			// Run the method and collect the result.
			const isWorker = Utils.getMeta<string[]>('type', 'autowire')(handler.controller.constructor, undefined, []).includes('worker');
			let result = await handler.controller[handler.methodName].bind(handler.controller)(...functionArguments, isWorker ? undefined : isWorker);

			// Check for transformers and apply them.
			try {
				if (handler.transformers.length > 0) {
					for (const transform of handler.transformers) {
						result = await transform(context, result);
					}
				}
			} catch (err) {
				this.logger.error(`[HTTP]: Transformer failed for method: ${handler.methodName} in controller: ${handler.controller.constructor.name}, reason: ${(err as Error).message}.`);
			}

			// Now convert the response to a Response object.
			return toResponse(result, context);

		} catch (err) {

			// Log the error, and return a 500.
			this.logger.error(`[HTTP]: Failed ${method}: ${matchedPath}, with controller: ${handler.controller.constructor.name} and method: ${handler.methodName}, reason: ${(err as Error).message}.`);
			console.error(err);
			return new Response(undefined, { status: 500, headers: context.getResponseHeaders() });
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

		// Get the custom headers.
		const userHeaders: Record<string, string> = {};
		context.getResponseHeaders().forEach((value, key) => {
			userHeaders[key] = value;
		});

		// Let's create the SSE link.
		return sseContext.getSseResponse(userHeaders);
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
	private async getMethodArgument(index: number, args: IControllerMethodArgItem[], context: HttpContext, params: Record<string, any>) {

		// Check for args.
		const arg = args.find(arg => arg.index === index);
		if (!arg) return undefined;

		// Parse the cookies.
		const cookies = context.getCookies();

		// Switch on the type.
		switch (arg.type) {
			case 'request': return context.getRequest();
			case 'server': return context.getServer();
			case 'params': return arg.name ? this.coerceValue(params[arg.name]) : params;
			case 'query': return this.getProperty(context.getUrl().searchParams, arg.name);
			case 'headers': return this.getProperty(context.getRequest().headers, arg.name);
			case 'cookies': return this.getProperty(cookies, arg.name);
			case 'body': return await context.getBody(params.format);
			case 'url': return context.getUrl();
			case 'method': return context.getRequest().method;
		}
	}

	/**
	 * Will get a property from a collection (map).
	 * @param collection The collection to get from.
	 * @param key The key to get [optional].
	 * @returns any
	 * @private
	 */
	private getProperty(collection: URLSearchParams | Headers | Map<string, any>, key?: string) {
		if (!key) return collection;
		const value = collection.get(key);
		return this.coerceValue(value);
	}

	/**
	 * Will coerce a value to the correct type.
	 * @param value The value to coerce.
	 * @returns any
	 * @private
	 */
	private coerceValue(value: any) {
		if (value === null) return undefined;
		if (value === 'true') return true;
		if (value === 'false') return false;
		if (!Number.isNaN(Number(value))) return Number(value);
		return value;
	}
}
