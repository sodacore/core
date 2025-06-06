/**
 * Will validate whether the route matches the path, based around
 * the http's routing mechanism.
 * @param path The path to match against.
 * @param value The path value to check against the path.
 * @returns boolean
 */
export function doesRouteMatch(path: string, value: string) {

	// Let's take the path and split it.
	const parts = path.split('/')
		.filter(part => part.length > 0)
		.map(part => part.startsWith(':') ? '[^/]+' : part);

	// Build the regex.
	const regex = new RegExp(`^/${parts.join('/')}$`, 'gi');
	const regexWithSlash = new RegExp(`^/${parts.join('/')}/$`, 'gi');

	// Test the value.
	return regex.test(value) || regexWithSlash.test(value);
}

/**
 * Will return the route parameters from the path, based
 * on the given route structure.
 * @param route The route path.
 * @param path The path value.
 * @returns Record<string, string>
 */
export function getRouteParams(route: string, path: string) {

	// Let's take the path and split it.
	const routeParts = route.split('/');
	const pathParts = path.split('/');

	// Loop the route parts.
	const params: { [key: string]: string } = {};
	for (let i = 0; i < routeParts.length; i++) {

		// If a param.
		if (routeParts[i].startsWith(':')) {
			params[routeParts[i].slice(1)] = pathParts[i];
		}
	}

	// Return the params.
	return params;
}

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
export function toResponse(value: any) {

	// Response.
	if (value instanceof Response) return value;

	// Error: 500.
	if (value instanceof Error) return new Response(value.message, { status: 500 });

	// Null: 404.
	if (value === null) return new Response(undefined, { status: 404 });

	// String/Number: 200.
	if (typeof value === 'string' || typeof value === 'number') return new Response(String(value), { status: 200 });

	// Object: 200.
	if (typeof value === 'object') return new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

	// Boolean:true: 201
	if (typeof value === 'boolean' && value === true) return new Response(undefined, { status: 201 });

	// Boolean:false: 204
	if (typeof value === 'boolean' && value === false) return new Response(undefined, { status: 400 });

	// Undefined: 204.
	return new Response(undefined, { status: 204 });
}
