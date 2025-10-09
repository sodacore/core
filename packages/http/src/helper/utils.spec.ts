import { describe, expect, it } from 'bun:test';
import { doesRouteMatch, getRouteParams, parseCookies, toResponse } from './utils';

// Minimal mock for HttpContext
class MockHttpContext {
	public headers = new Map();
	public getResponseHeaders() { return this.headers; }
	public setResponseHeader(key: string, value: string) { this.headers.set(key, value); }
}

describe('doesRouteMatch', () => {
	it('matches exact route', () => {
		expect(doesRouteMatch('/foo/bar', '/foo/bar')).toBe(true);
	});

	it('matches with param', () => {
		expect(doesRouteMatch('/foo/:id', '/foo/123')).toBe(true);
	});

	it('matches with optional param', () => {
		expect(doesRouteMatch('/foo/?:id', '/foo/123')).toBe(true);
	});

	it('matches with wildcard', () => {
		expect(doesRouteMatch('/foo/*', '/foo/bar/baz')).toBe(true);
	});

	it('does not match different route', () => {
		expect(doesRouteMatch('/foo/bar', '/foo/baz')).toBe(false);
	});

	it('matches root route', () => {
		expect(doesRouteMatch('/', '/')).toBe(true);
	});

	it('matches route with trailing slash', () => {
		expect(doesRouteMatch('/foo/bar/', '/foo/bar')).toBe(true);
		expect(doesRouteMatch('/foo/bar', '/foo/bar/')).toBe(true);
	});

	it('does not match if value is shorter', () => {
		expect(doesRouteMatch('/foo/bar/baz', '/foo/bar')).toBe(false);
	});

	it('matches with multiple params', () => {
		expect(doesRouteMatch('/foo/:id/:name', '/foo/123/john')).toBe(true);
	});

	it('matches with optional param missing', () => {
		expect(doesRouteMatch('/foo/?:id', '/foo')).toBe(true);
	});

	it('does not match if path is longer', () => {
		expect(doesRouteMatch('/foo', '/foo/bar')).toBe(false);
	});
});

describe('getRouteParams', () => {
	it('extracts params from route', () => {
		expect(getRouteParams('/foo/:id', '/foo/123')).toEqual({ id: '123' });
	});

	it('extracts multiple params', () => {
		expect(getRouteParams('/foo/:id/:name', '/foo/123/john')).toEqual({ id: '123', name: 'john' });
	});

	it('extracts optional param', () => {
		expect(getRouteParams('/foo/?:id', '/foo/123')).toEqual({ id: '123' });
	});

	it('returns empty object if no params', () => {
		expect(getRouteParams('/foo/bar', '/foo/bar')).toEqual({});
	});

	it('handles missing param value', () => {
		expect(getRouteParams('/foo/:id', '/foo/')).toEqual({ id: '' });
	});

	it('handles extra path parts', () => {
		expect(getRouteParams('/foo/:id', '/foo/123/extra')).toEqual({ id: '123' });
	});
});

describe('parseCookies', () => {
	it('parses cookies string', () => {
		const cookies = 'foo=bar; baz=qux';
		const map = parseCookies(cookies);
		expect(map.get('foo')).toBe('bar');
		expect(map.get('baz')).toBe('qux');
	});

	it('handles empty string', () => {
		expect(parseCookies('')).toEqual(new Map());
	});

	it('trims keys and values', () => {
		const cookies = ' foo = bar ;baz =qux ';
		const map = parseCookies(cookies);
		expect(map.get('foo')).toBe('bar');
		expect(map.get('baz')).toBe('qux');
	});

	it('handles cookies with no value', () => {
		const cookies = 'foo=;bar=baz';
		const map = parseCookies(cookies);
		expect(map.get('foo')).toBe('');
		expect(map.get('bar')).toBe('baz');
	});

	it('handles single cookie', () => {
		const cookies = 'foo=bar';
		const map = parseCookies(cookies);
		expect(map.get('foo')).toBe('bar');
	});
});

describe('toResponse', () => {
	it('returns Response as-is and sets headers', () => {
		const ctx = new MockHttpContext();
		ctx.setResponseHeader('X-Test', 'abc');
		const resp = new Response('ok');
		const result = toResponse(resp, ctx as any);
		expect(result).toBe(resp);
		expect(result.headers.get('X-Test')).toBe('abc');
	});

	it('returns 500 for Error', async () => {
		const ctx = new MockHttpContext();
		const err = new Error('fail');
		const result = toResponse(err, ctx as any);
		expect(result.status).toBe(500);
		expect(await result.text()).toBe('fail');
	});

	it('returns 404 for null', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse(null, ctx as any);
		expect(result.status).toBe(404);
		expect(await result.text()).toBe('');
	});

	it('returns 200 for string', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse('hello', ctx as any);
		expect(result.status).toBe(200);
		expect(await result.text()).toBe('hello');
	});

	it('returns 200 for number', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse(42, ctx as any);
		expect(result.status).toBe(200);
		expect(await result.text()).toBe('42');
	});

	it('returns 200 and JSON for object', async () => {
		const ctx = new MockHttpContext();
		const obj = { foo: 'bar' };
		const result = toResponse(obj, ctx as any);
		expect(result.status).toBe(200);
		expect(result.headers.get('Content-Type')).toBe('application/json');
		expect(await result.text()).toBe(JSON.stringify(obj));
	});

	it('returns 201 for boolean true', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse(true, ctx as any);
		expect(result.status).toBe(201);
	});

	it('returns 400 for boolean false', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse(false, ctx as any);
		expect(result.status).toBe(400);
	});

	it('returns 204 for undefined', async () => {
		const ctx = new MockHttpContext();
		const result = toResponse(undefined, ctx as any);
		expect(result.status).toBe(204);
	});
});
