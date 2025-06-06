import type { Server } from 'bun';
import { parseCookies } from '../helper/utils';

/**
 * The HTTP context class, will be passed as the last
 * parameter to all controller methods called by the
 * HTTP controller.
 * @class HttpContext
 * @default
 */
export default class HttpContext {
	protected auth = new Map<string, any>();
	protected session = new Map<string, any>();
	protected url: URL;
	protected cookies: Map<string, string>;

	/**
	 * Initialise the request, defined by the http service
	 * automatically.
	 * @param request Request object.
	 * @param server Server object.
	 * @constructor
	 */
	public constructor(
		protected request: Request,
		protected server: Server,
	) {
		this.url = new URL(this.request.url) as any;
		this.cookies = parseCookies(this.request.headers.get('cookies') ?? '');
	}

	/**
	 * Will return a processed URL object.
	 * @returns URL
	 */
	public getUrl() {
		return this.url;
	}

	/**
	 * Will process and return the cookies.
	 * @returns Map<string, string>
	 */
	public getCookies() {
		return this.cookies;
	}

	/**
	 * Will return a session value, if no key is provided
	 * will return the entire session object.
	 * @param key The key to retrieve. [optional]
	 * @returns any
	 */
	public getSession(key?: string) {
		return key ? this.session.get(key) : this.session;
	}

	/**
	 * Will set a session value, can be used by middleware to
	 * assign values, the session object is a pre-defined map
	 * available for usage.
	 * @param key A key value.
	 * @param value A value for the
	 */
	public setSession(key: string, value: any) {
		this.session.set(key, value);
	}

	/**
	 * Will return an array of keys within the session
	 * object.
	 * @returns string[]
	 */
	public getSessionKeys() {
		return this.session.keys();
	}

	/**
	 * Will set an auth value, can be used by middleware to
	 * assign values, the auth object is a pre-defined map
	 * available for usage.
	 * @param key A key value.
	 * @param value A value for the
	 */
	public setAuth(key: string, value: any) {
		this.auth.set(key, value);
	}

	/**
	 * Will get an auth value from the context.
	 * @param key The key to retrieve.
	 * @returns T
	 * @generic T
	 */
	public getAuth<T = any>(key: string) {
		return this.auth.get(key) as T;
	}

	/**
	 * Will return an array of keys within the Auth
	 * object.
	 * @returns string[]
	 */
	public getAuthKeys() {
		return this.auth.keys();
	}

	/**
	 * Will return the request object.
	 * @returns Request
	 */
	public getRequest() {
		return this.request;
	}

	/**
	 * Will return the server object.
	 * @returns Server
	 */
	public getServer() {
		return this.server;
	}

	/**
	 * Will return a query parameter from the URL, based on the
	 * given name argument, or the entire query object if no name
	 * provided.
	 * @param name Name of the search parameter. [optional]
	 * @returns string
	 * @generic T
	 */
	public getQuery<T = Record<string, any>>(name?: string) {
		return name ? this.asNumber(this.url.searchParams.get(name)) : this.url.searchParams as T;
	}

	/**
	 * Will return a cookie from the request, based on the given
	 * name argument.
	 * @param name Name of the cookie to retrieve.
	 * @returns string
	 */
	public getCookie(name: string) {
		return this.getCookies().get(name);
	}

	/**
	 * Will return a URL parameter from the request,
	 * based on the given name, or return the search
	 * params entire object.
	 * @param name Name of param to return. [optional]
	 * @returns string
	 */
	public getParam(name?: string) {
		return name ? this.asNumber(this.url.searchParams.get(name)) : this.url.searchParams;
	}

	/**
	 * Return a header from the request, based on the
	 * given name, if no name, return all headers.
	 * @param name Name of header. [optional]
	 * @returns string
	 */
	public getHeader(name?: string) {
		return name ? this.request.headers.get(name) : this.request.headers;
	}

	/**
	 * Return the body of the request, by default will
	 * attempt to parse JSON, but you can pass the format
	 * as 'raw' to return the raw text.
	 * @param format Format of the body. [optional]
	 * @returns T
	 * @generic T
	 */
	public getBody<T = any>(format: 'json' | 'raw' = 'json') {
		return format === 'json' ? this.request.json() as T : this.request.text() as T;
	}

	/**
	 * Will return the request method used to make the
	 * request, useful if you are using the same method
	 * to service multiple routes.
	 * @returns string
	 */
	public getMethod() {
		return this.request.method;
	}

	/**
	 * Will accept a number and chekc if isNaN and either
	 * convert it to a number or return the original value.
	 * @param value The value to check.
	 * @returns any
	 */
	private asNumber(value: any) {
		const number = Number(value);
		return Number.isNaN(number) ? value : number;
	}
}
