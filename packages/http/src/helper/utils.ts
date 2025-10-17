import type HttpContext from '../context/http';

/**
 * Will parse the cookies from the cookie string.
 * @param cookies Cookie string.
 * @returns Map<string, string>
 */
export function parseCookies(cookies: string) {
	const cookieMap = new Map<string, string>();
	cookies.split(';').filter(p => p !== '').forEach(cookie => {
		const [key, value] = cookie.split('=');
		cookieMap.set(String(key).trim(), String(value).trim());
	});
	return cookieMap;
}

/**
 * Will convert the output to some form of Response object.
 * @param value The value to check against.
 * @returns Response.
 */
export function toResponse(value: any, context: HttpContext) {

	// Response.
	if (value instanceof Response) {
		context.getResponseHeaders().forEach((v, k) => value.headers.set(k, v));
		return value;
	}

	// Error: 500.
	if (value instanceof Error) {
		return new Response(value.message, {
			status: 500,
			headers: context.getResponseHeaders(),
		});
	}

	// Null: 404.
	if (value === null) {
		return new Response(undefined, {
			status: 404,
			headers: context.getResponseHeaders(),
		});
	}

	// String/Number: 200.
	if (typeof value === 'string' || typeof value === 'number') {
		return new Response(String(value), {
			status: 200,
			headers: context.getResponseHeaders(),
		});
	}

	// Object: 200.
	if (typeof value === 'object') {
		context.setResponseHeader('Content-Type', 'application/json');
		return new Response(JSON.stringify(value), {
			status: 200,
			headers: context.getResponseHeaders(),
		});
	}

	// Boolean:true: 201
	if (typeof value === 'boolean' && value === true) {
		return new Response(undefined, {
			status: 201,
			headers: context.getResponseHeaders(),
		});
	}

	// Boolean:false: 204
	if (typeof value === 'boolean' && value === false) {
		return new Response(undefined, {
			status: 400,
			headers: context.getResponseHeaders(),
		});
	}

	// Undefined: 204.
	return new Response(undefined, {
		status: 204,
		headers: context.getResponseHeaders(),
	});
}
