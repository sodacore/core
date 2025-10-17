/*
	Route matching & parameter extraction with LRU caching.

	Conventions:
	- Tabs, single quotes, template strings.
	- No external deps.
	- All helpers exported for reuse/testing.
*/

/* =============================
 *           Types
 * ============================= */

export type RouteMatchCompile = {
	regex: RegExp,
	/** Ordered list of param names as they appear in the compiled pattern (unique). */
	params: string[],
	/** Indicates whether the pattern contains a multi-segment wildcard '**' (end-only). */
	hasMulti: boolean,
};

export type SegmentKind = | 'static' | 'param' | 'wildcard' | 'glob';

export type ParamPattern = { type: 'star' | 'double-star' | 'glob', source: string };

export type StaticToken = {
	kind: 'static',
	raw: string,
	value: string,
};

export type WildcardToken = {
	kind: 'wildcard',
	raw: string,
	multi: boolean, // '*' = false, '**' = true
	optional: false,
};

export type GlobToken = {
	kind: 'glob',
	raw: string,
	multi: boolean, // whether the glob uses ** (multi-seg), allowed only in last segment
	pattern: string, // the glob string for this segment (e.g., '*.png', '**.png', '*.{png,svg}')
};

export type ParamToken = {
	kind: 'param',
	raw: string,
	name: string,
	optional: boolean, // only allowed if this is the last segment
	pattern?: ParamPattern, // optional constraint for the param
};

export type SegmentToken = StaticToken | WildcardToken | GlobToken | ParamToken;

export type BuildResult = { pattern: string, params: string[], hasMulti: boolean };

/* =============================
 *        Public API
 * ============================= */

/** Determine if a value path matches a route. */
export function doesRouteMatch(route: string, value: string): boolean {
	const compiled = compileRouteCached(route);
	const normalized = normalizePath(value);
	return compiled.regex.test(normalized);
}

/** Extract params if a value matches; returns {} if not matched. */
export function getRouteParams(route: string, value: string): Record<string, string> {
	const compiled = compileRouteCached(route);
	const normalized = normalizePath(value);
	const m = compiled.regex.exec(normalized);
	if (!m) return {};
	const out: Record<string, string> = {};
	for (const name of compiled.params) {
		const got = (m.groups?.[name] ?? null) as string | null;
		if (got !== null && got !== undefined) {
			out[name] = safeDecode(got);
		}
	}
	return out;
}

/** Compile a route pattern into an anchored RegExp and param order (no cache). */
export function compileRoute(route: string): RouteMatchCompile {
	const normalized = normalizePath(route);
	const segments = splitSegments(normalized);

	validateNoEmptyInMiddle(segments);
	const tokens = segments.map((seg, i) => tokenizeSegment(seg, i, segments.length));

	validateTokens(tokens);

	const { pattern, params, hasMulti } = buildRegexFromTokens(tokens);
	const regex = new RegExp(`^${pattern}$`);
	return { regex, params, hasMulti };
}

/* =============================
 *        LRU Caching API
 * ============================= */

export type LruCache<K, V> = {
	get: (key: K) => V | undefined,
	set: (key: K, value: V) => void,
	has: (key: K) => boolean,
	size: () => number,
	clear: () => void,
};

export function createLruCache<K, V>(capacity = 1000): LruCache<K, V> {
	if (capacity <= 0) throw new Error('LRU capacity must be > 0');
	const map = new Map<K, V>();
	return {
		get(key) {
			if (!map.has(key)) return undefined;
			const val = map.get(key)!;
			// refresh recency
			map.delete(key);
			map.set(key, val);
			return val;
		},
		set(key, value) {
			if (map.has(key)) map.delete(key);
			map.set(key, value);
			if (map.size > capacity) {
				const oldest = map.keys().next().value as K;
				map.delete(oldest);
			}
		},
		has: key => map.has(key),
		size: () => map.size,
		clear: () => map.clear(),
	};
}

let routeCacheCapacity = 1000;
let routeCache: LruCache<string, RouteMatchCompile> = createLruCache(routeCacheCapacity);

/** Update the max entries of the internal route cache (clears existing cache). */
export function setRouteCacheCapacity(capacity: number): void {
	routeCacheCapacity = capacity;
	routeCache = createLruCache(routeCacheCapacity);
}

/** Clear all compiled patterns from the cache. */
export function clearRouteCache(): void {
	routeCache.clear();
}

/** Compile with LRU cache. */
export function compileRouteCached(route: string): RouteMatchCompile {
	const key = normalizePath(route);
	const cached = routeCache.get(key);
	if (cached) return cached;
	const compiled = compileRoute(key);
	routeCache.set(key, compiled);
	return compiled;
}

/** Precompile a batch of routes and seed the cache. Returns a map of route -> compiled. */
export function precompileRoutes(routes: string[]): Map<string, RouteMatchCompile> {
	const out = new Map<string, RouteMatchCompile>();
	routes.forEach(r => {
		const key = normalizePath(r);
		const compiled = compileRoute(key);
		routeCache.set(key, compiled);
		out.set(key, compiled);
	});
	return out;
}

/* =============================
 *           Parsing
 * ============================= */

export function normalizePath(input: string): string {
	let s = input.trim();
	if (!s.startsWith('/')) s = `/${s}`;
	s = s.replace(/\/{2,}/g, '/');
	if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
	return s;
}

export function splitSegments(path: string): string[] {
	return path.split('/');
}

export function validateNoEmptyInMiddle(segments: string[]): void {
	for (let i = 1; i < segments.length; i++) {
		if (segments[i] === '' && i !== 0 && i !== segments.length - 1) {
			throw new Error('Invalid route: empty segment found between slashes.');
		}
	}
}

/** Tokenize a single segment. */
export function tokenizeSegment(seg: string, index: number, total: number): SegmentToken {
	if (index === 0 && seg === '') {
		return { kind: 'static', raw: seg, value: '' };
	}

	const isLast = index === total - 1;

	// Param: :name, :name?, :name(pattern), :name(pattern)?
	if (seg.startsWith(':')) {
		const m = /^:([A-Za-z0-9]+)(?:\(([^)]+)\))?(\?)?$/.exec(seg);
		if (!m) {
			throw new Error(`Invalid param segment '${seg}'. Expected ':name', ':name?', or ':name(pattern)'.`);
		}

		const [, name, paren, q] = m;
		const optional = q === '?';
		if (optional && !isLast) {
			throw new Error(`Invalid optional param in middle: '${seg}'. Optional params are only allowed at the end.`);
		}

		let pattern: ParamPattern | undefined;
		if (paren) {
			if (paren === '*') {
				pattern = { type: 'star', source: paren };
			} else if (paren === '**') {
				if (!isLast) {
					throw new Error(`'**' may only appear in the last segment: '${seg}'.`);
				}
				pattern = { type: 'double-star', source: paren };
			} else {
				const usesDouble = paren.includes('**');
				if (usesDouble && !isLast) {
					throw new Error(`'**' may only appear in the last segment: '${seg}'.`);
				}
				pattern = { type: 'glob', source: paren };
			}
		}

		return {
			kind: 'param',
			raw: seg,
			name,
			optional,
			pattern,
		};
	}

	// Bare wildcards: '*' or '**'
	if (seg === '*') {
		return { kind: 'wildcard', raw: seg, multi: false, optional: false };
	}
	if (seg === '**') {
		if (!isLast) {
			throw new Error(`'**' may only appear in the last segment: '${seg}'.`);
		}
		return { kind: 'wildcard', raw: seg, multi: true, optional: false };
	}

	// Glob segments, like '*.png' or '**.png' or '*.{png,svg}'
	if (looksLikeGlob(seg)) {
		const usesDouble = seg.includes('**');
		if (usesDouble && !isLast) {
			throw new Error(`'**' in a glob may only appear in the last segment: '${seg}'.`);
		}
		return { kind: 'glob', raw: seg, multi: usesDouble, pattern: seg };
	}

	// Plain static
	return { kind: 'static', raw: seg, value: seg };
}

export function looksLikeGlob(seg: string): boolean {
	return seg.includes('*') || /{\s*[^}]+\s*}/.test(seg);
}

export function validateTokens(tokens: SegmentToken[]): void {
	for (const t of tokens) {
		if (t.kind === 'param') {
			if (!/^[A-Za-z0-9]+$/.test(t.name)) {
				throw new Error(`Invalid param name '${t.name}'. Use A–Z, a–z, 0–9 only.`);
			}
		}
	}
}

/* =============================
 *      Regex Construction
 * ============================= */

export function buildRegexFromTokens(tokens: SegmentToken[]): BuildResult {
	const parts: string[] = [];
	const params: string[] = [];
	let hasMulti = false;

	for (let i = 0; i < tokens.length; i++) {
		const t = tokens[i];
		const isFirst = i === 0;
		const isLast = i === tokens.length - 1;

		// Always re-add slash between segments (skip for leading empty root '')
		if (!isFirst) parts.push('/');

		switch (t.kind) {
			case 'static': {
				if (i === 0 && t.value === '') {
					// Leading slash accounted for
				} else {
					parts.push(escapeRegex(t.value));
				}
				break;
			}
			case 'wildcard': {
				if (t.multi) {
					hasMulti = true;
					parts.push('.+'); // allow slashes, must consume at least one char
				} else {
					parts.push('[^/]+'); // single segment
				}
				break;
			}
			case 'glob': {
				const pat = globToRegex(t.pattern, { allowMulti: isLast });
				if (t.multi) hasMulti = true;
				parts.push(pat);
				break;
			}
			case 'param': {
				let inner: string;
				if (!t.pattern) {
					inner = '[^/]+';
				} else if (t.pattern.type === 'star') {
					inner = '[^/]+';
				} else if (t.pattern.type === 'double-star') {
					if (!isLast) {
						throw new Error(`'**' param may only appear in the last segment: '${t.raw}'.`);
					}
					hasMulti = true;
					inner = '.+';
				} else {
					const usesDouble = t.pattern.source.includes('**');
					if (usesDouble && !isLast) {
						throw new Error(`'**' in param glob may only appear in last segment: '${t.raw}'.`);
					}
					if (usesDouble) hasMulti = true;
					inner = globToRegex(t.pattern.source, { allowMulti: isLast });
				}

				if (t.optional) {
					// If this is the first real segment after the root, keep the leading '/'
					// and make only the capture optional.
					if (!isFirst) {
						const prev = parts[parts.length - 1];
						if (i === 1 && prev === '/') {
							// we already emitted '/', so add an optional capture *without* another slash
							parts.push(`(?:${namedCapture(t.name, inner)})?`);
						} else {
							// normal case: replace the just-added '/' with an optional '/<capture>'
							parts[parts.length - 1] = `(?:/${namedCapture(t.name, inner)})?`;
						}
					} else {
						// Optional at true start (no slash before)
						parts.push(`(?:${namedCapture(t.name, inner)})?`);
					}
				} else {
					parts.push(namedCapture(t.name, inner));
				}

				if (!params.includes(t.name)) params.push(t.name);
				break;
			}
		}
	}

	return { pattern: parts.join(''), params, hasMulti };
}

export function namedCapture(name: string, inner: string): string {
	return `(?<${name}>${inner})`;
}

export function escapeRegex(s: string): string {
	return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

/**
 * Convert a glob expression for a URL segment context.
 * - '*'  => '[^/]*' (no slash)
 * - '**' => expanded as a sequence of segments when used with suffix/prefix (e.g. '**.png'),
 *           or '.+' if the entire segment is exactly '**'.
 * - '{a,b,c}' => '(?:a|b|c)'
 */
export function globToRegex(glob: string, opts: { allowMulti: boolean }): string {
	if (glob === '*') return '[^/]*';
	if (glob === '**') {
		if (!opts.allowMulti) throw new Error('Invalid glob "**" before the last segment.');
		return '.+'; // entire segment '**'
	}

	let i = 0;
	let rx = '';
	let pendingDouble = false; // we saw a '**' and may need a final-segment wildcard before suffix

	const flushPendingDoubleIfNeeded = () => {
		if (pendingDouble) {
			// allow any chars in the *final* segment after the multi-segment part
			rx += '[^/]*';
			pendingDouble = false;
		}
	};

	while (i < glob.length) {
		const c = glob[i];

		if (c === '*') {
			const isDouble = glob[i + 1] === '*';
			if (isDouble) {
				if (!opts.allowMulti) throw new Error('Invalid glob "**" before the last segment.');
				// multi-segment part
				rx += '(?:[^/]+/)*';
				pendingDouble = true; // we might need a final '[^/]*' before a suffix like '.png'
				i += 2;
				continue;
			}
			// single star consumes within the segment — no need for pending tail
			rx += '[^/]*';
			pendingDouble = false;
			i += 1;
			continue;
		}

		if (c === '{') {
			flushPendingDoubleIfNeeded();
			const end = glob.indexOf('}', i + 1);
			if (end === -1) throw new Error(`Invalid glob: missing '}' in '${glob}'.`);
			const body = glob.slice(i + 1, end).trim();
			const alts = body.split(',').map(s => s.trim()).filter(Boolean);
			if (alts.length === 0) throw new Error(`Invalid glob: empty alternation '{}' in '${glob}'.`);
			rx += `(?:${alts.map(a => escapeRegex(a)).join('|')})`;
			i = end + 1;
			continue;
		}

		// literal
		flushPendingDoubleIfNeeded();
		rx += escapeRegex(c);
		i += 1;
	}

	// If '**' was the last token *within* a larger pattern, allow trailing chars
	if (pendingDouble) rx += '[^/]*';

	return rx;
}

/* =============================
 * Utilities
 * ============================= */

export function safeDecode(s: string): string {
	try {
		return s.includes('%') ? decodeURIComponent(s) : s;
	} catch {
		return s;
	}
}

/* =============================
 *           Examples
 * ============================= */
// doesRouteMatch('/foo', '/foo')                            -> true
// doesRouteMatch('/foo/*', '/foo/bar')                      -> true
// doesRouteMatch('/foo/**', '/foo/bar/baz')                 -> true
// doesRouteMatch('/asset/:name(*)', '/asset/hello.txt')     -> true
// doesRouteMatch('/asset/:path(**)', '/asset/a/b/c.txt')    -> true
// doesRouteMatch('/images/:n(*.png)', '/images/cat.png')    -> true
// doesRouteMatch('/images/:p(*.{png,svg})', '/images/x.svg')-> true
// doesRouteMatch('/foo/**.png', '/foo/a/b/c.png')           -> true

// getRouteParams('/images/:n(*.png)', '/images/cat.png')    -> { n: 'cat.png' }
// getRouteParams('/asset/:path(**)?', '/asset')             -> {}
// getRouteParams('/asset/:path(**)?', '/asset/a/b')         -> { path: 'a/b' }

/* =============================
 *            Invalid
 * ============================= */
// '/foo/:id?/bar'                    -> optional in middle
// '/a/**/b'                          -> '**' not at end
// '/a/:p(**)/b'                      -> '**' param not at end
// '/a/**.png/b.png'                  -> '**' glob not at end
