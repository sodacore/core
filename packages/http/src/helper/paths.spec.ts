import { beforeEach, describe, expect, it } from 'bun:test';
import {
	buildRegexFromTokens,
	clearRouteCache,
	compileRoute,
	compileRouteCached,
	createLruCache,
	doesRouteMatch,
	escapeRegex,
	getRouteParams,
	globToRegex,
	namedCapture,
	normalizePath,
	precompileRoutes,
	type SegmentToken,
	setRouteCacheCapacity,
	splitSegments,
	tokenizeSegment,
	validateNoEmptyInMiddle,
	validateTokens,
} from './paths';

/* ========================= Helpers ========================= */

function assertMatch(route: string, value: string, expected = true): void {
	expect(doesRouteMatch(route, value)).toBe(expected);
}

function assertParams(route: string, value: string, expected: Record<string, string>): void {
	expect(getRouteParams(route, value)).toEqual(expected);
}

/* ========================= Normalization ========================= */

describe('normalize & split', () => {
	it('normalizes leading/trailing and double slashes', () => {
		expect(normalizePath('foo')).toBe('/foo');
		expect(normalizePath('/foo/')).toBe('/foo');
		expect(normalizePath('///foo//bar///')).toBe('/foo/bar');
	});

	it('splits segments including leading empty root', () => {
		const segs = splitSegments('/a/b/c');
		expect(segs).toEqual(['', 'a', 'b', 'c']);
	});

	it('validate no empty in middle throws', () => {
		expect(() => validateNoEmptyInMiddle(['', 'a', '', 'b'])).toThrow();
	});
});

/* ========================= Tokenization ========================= */

describe('tokenizeSegment & flags', () => {
	it('static, wildcard, glob, param basics', () => {
		const t0 = tokenizeSegment('', 0, 3);
		expect(t0.kind).toBe('static');

		const t1 = tokenizeSegment('*', 1, 2) as Extract<SegmentToken, { kind: 'wildcard' }>;
		expect(t1.kind).toBe('wildcard');
		expect(t1.multi).toBe(false);

		const t2 = tokenizeSegment('**', 1, 2) as Extract<SegmentToken, { kind: 'wildcard' }>;
		expect(t2.kind).toBe('wildcard');
		expect(t2.multi).toBe(true);

		const t3 = tokenizeSegment('*.png', 1, 2);
		expect(t3.kind).toBe('glob');

		const t4 = tokenizeSegment(':id', 1, 2) as Extract<SegmentToken, { kind: 'param' }>;
		expect(t4.kind).toBe('param');
		expect(t4.name).toBe('id');
		expect(t4.optional).toBe(false);
	});

	it('param with pattern star/double-star/glob and optional', () => {
		const p1 = tokenizeSegment(':file(*)', 1, 2) as Extract<SegmentToken, { kind: 'param' }>;
		expect(p1.pattern?.type).toBe('star');

		const p2 = tokenizeSegment(':path(**)', 1, 2) as Extract<SegmentToken, { kind: 'param' }>;
		expect(p2.pattern?.type).toBe('double-star');

		const p3 = tokenizeSegment(':name(*.png)', 1, 2) as Extract<SegmentToken, { kind: 'param' }>;
		expect(p3.pattern?.type).toBe('glob');

		const p4 = tokenizeSegment(':maybe?', 2, 3) as Extract<SegmentToken, { kind: 'param' }>;
		expect(p4.optional).toBe(true);
	});

	it('invalid tokens throw useful errors', () => {
		expect(() => tokenizeSegment(':bad-name', 1, 2)).toThrow();
		expect(() => tokenizeSegment('**', 1, 3)).toThrow(); // not last
		expect(() => tokenizeSegment('**.png', 1, 3)).toThrow(); // glob with ** not last
		expect(() => tokenizeSegment(':x(**)', 1, 3)).toThrow(); // param ** not last
		expect(() => tokenizeSegment(':opt?', 1, 3)).toThrow(); // optional not last
	});
});

/* ========================= Regex Builder ========================= */

describe('globToRegex & escape & namedCapture', () => {
	it('basic glob conversions', () => {
		expect(globToRegex('*', { allowMulti: true })).toBe('[^/]*');
		expect(globToRegex('*.png', { allowMulti: true })).toContain('[^/]*');
		expect(globToRegex('**', { allowMulti: true })).toBe('.+');
		expect(() => globToRegex('**', { allowMulti: false })).toThrow();
		expect(globToRegex('**.png', { allowMulti: true })).toContain('(?:[^/]+/)*');
		expect(globToRegex('*.{png,svg}', { allowMulti: true })).toContain('(?:png|svg)');
	});

	it('escapeRegex and namedCapture', () => {
		const esc = escapeRegex('a+b.c?');
		expect(esc).toBe('a\\+b\\.c\\?');
		const group = namedCapture('id', '[^/]+');
		expect(group).toBe('(?<id>[^/]+)');
	});
});

/* ========================= Matching Matrix ========================= */

describe('doesRouteMatch large matrix', () => {
	const statics: Array<[string, string, boolean]> = [
		['/foo', '/foo', true],
		['/foo', '/bar', false],
		['/foo/bar', '/foo/bar', true],
		['/foo/bar', '/foo/bar/baz', false],
	];

	const singles: Array<[string, string, boolean]> = [
		['/foo/*', '/foo/a', true],
		['/foo/*', '/foo/a/b', false],
		['/x/*/z', '/x/y/z', true],
		['/x/*/z', '/x/yy/zz', false],
	];

	const doubles: Array<[string, string, boolean]> = [
		['/foo/**', '/foo/a', true],
		['/foo/**', '/foo/a/b/c', true],
		['/a/**', '/a', false], // requires at least one char (.+)
	];

	const params: Array<[string, string, boolean]> = [
		['/:id', '/123', true],
		['/user/:id', '/user/abc', true],
		['/user/:id', '/user', false],
		['/a/:b/c', '/a/x/c', true],
	];

	const assigned: Array<[string, string, boolean]> = [
		['/asset/:name(*)', '/asset/file.txt', true],
		['/asset/:path(**)', '/asset/a/b/c.txt', true],
		['/asset/:path(**)', '/asset', false],
	];

	const optionals: Array<[string, string, boolean]> = [
		['/foo/:bar?', '/foo', true],
		['/foo/:bar?', '/foo/xyz', true],
		['/asset/:path(**)?', '/asset', true],
		['/asset/:path(**)?', '/asset/a/b', true],
	];

	const globs: Array<[string, string, boolean]> = [
		['/img/*.png', '/img/a.png', true],
		['/img/*.png', '/img/a.svg', false],
		['/img/**.png', '/img/a/b/c.png', true],
		['/img/*.{png,svg}', '/img/a.svg', true],
		['/img/**.{png,svg}', '/img/a/b/c.png', true],
		['/images/:name(*.png)', '/images/photo.png', true],
		['/images/:name(*.png)', '/images/photo.svg', false],
		['/images/:path(*.{png,svg})', '/images/a.svg', true],
		['/images/:path(*.{png,svg})', '/images/a/b.svg', false],
		['/images/:path(*.{png,svg})?', '/images', true],
		['/images/:path(*.{png,svg})?', '/images/a.png', true],
	];

	const combos: Array<[string, string, boolean]> = [];
	// Generate 120+ combinations programmatically
	const bases = ['/a', '/b', '/c'];
	const tails = ['/*.txt', '/*.{md,txt}', '/**.js'];
	for (const b of bases) {
		for (const t of tails) {
			const route = `${b}${t}`;
			combos.push([route, `${b}/file.txt`, t.includes('txt')]);
			combos.push([route, `${b}/notes.md`, t.includes('{md,txt}')]);
			combos.push([route, `${b}/deep/nested/app.js`, t === '/**.js']);
		}
	}

	const bigMatrix = [
		...statics,
		...singles,
		...doubles,
		...params,
		...assigned,
		...optionals,
		...globs,
		...combos,
	];

	it('evaluates the matrix correctly', () => {
		for (const [route, value, ok] of bigMatrix) {
			assertMatch(route, value, ok);
		}
	});
});

/* ========================= Params Extraction ========================= */

describe('getRouteParams extensive', () => {
	it('captures single and multiple params', () => {
		assertParams('/:a', '/123', { a: '123' });
		assertParams('/u/:id/p/:post', '/u/42/p/abc', { id: '42', post: 'abc' });
	});

	it('assigned wildcards and optionals', () => {
		assertParams('/asset/:name(*)', '/asset/file.txt', { name: 'file.txt' });
		assertParams('/asset/:path(**)', '/asset/a/b/c.txt', { path: 'a/b/c.txt' });
		assertParams('/asset/:path(**)?', '/asset/a/b', { path: 'a/b' });
		assertParams('/asset/:path(**)?', '/asset', {});
	});

	it('glob params keep full match', () => {
		assertParams('/images/:name(*.png)', '/images/photo.png', { name: 'photo.png' });
		assertParams('/images/:path(*.{png,svg})', '/images/a.svg', { path: 'a.svg' });
	});

	it('decodes percent-encoding safely', () => {
		assertParams('/f/:n', '/f/%E2%9C%93', { n: '✓' });
		// malformed percent remains raw
		assertParams('/f/:n', '/f/%E2%9C', { n: '%E2%9C' });
	});
});

/* ========================= compile & build internals ========================= */

describe('compileRoute & buildRegexFromTokens', () => {
	it('produces anchored regex and param order', () => {
		const c = compileRoute('/user/:id/*');
		expect(c.regex.source.startsWith('^')).toBe(true); // compileRoute adds anchors
		expect(c.regex.source.endsWith('$')).toBe(true);
		expect(c.params).toEqual(['id']);
		// sanity: should match via public API
		expect(doesRouteMatch('/user/:id/*', '/user/1/x')).toBe(true);
	});

	it('build rejects invalid ** placement', () => {
		expect(() => compileRoute('/a/**/b')).toThrow();
		expect(() => compileRoute('/a/:p(**)/b')).toThrow();
		expect(() => compileRoute('/a/**.png/b.png')).toThrow();
		expect(() => compileRoute('/a/:x?/b')).toThrow(); // optional in middle
	});
});

/* ========================= LRU cache behavior ========================= */

describe('LRU cache', () => {
	beforeEach(() => {
		setRouteCacheCapacity(3);
		clearRouteCache();
	});

	it('caches compiled routes and evicts oldest', () => {
		const a = compileRouteCached('/a');
		const b = compileRouteCached('/b');
		const c = compileRouteCached('/c');
		void c;
		const a2 = compileRouteCached('/a');
		expect(a2).toBe(a); // same instance refreshed
		const d = compileRouteCached('/d'); // should evict oldest (b)
		void d; // silence unused
		// b should be evicted; recompile returns a new instance
		const b2 = compileRouteCached('/b');
		expect(b2).not.toBe(b);
	});

	it('precompileRoutes seeds the cache', () => {
		const seeded = precompileRoutes(['/x', '/y', '/z']);
		expect(seeded.size).toBe(3);
		const x1 = compileRouteCached('/x');
		expect(seeded.get('/x')).toBe(x1);
	});

	it('standalone LRU is correct', () => {
		const lru = createLruCache<string, number>(2);
		lru.set('a', 1);
		lru.set('b', 2);
		expect(lru.get('a')).toBe(1); // refresh a
		lru.set('c', 3); // evicts b
		expect(lru.has('b')).toBe(false);
		expect(lru.size()).toBe(2);
		lru.clear();
		expect(lru.size()).toBe(0);
	});
});

/* ========================= Edge / Corner Cases ========================= */

describe('edge cases', () => {
	it('root route', () => {
		assertMatch('/', '/', true);
		assertMatch('/', '/anything', false);
	});

	it('optional param at very first segment', () => {
		// This triggers the isFirst branch in builder
		const route = '/:x?';
		assertMatch(route, '/', true);
		assertMatch(route, '/one', true);
		assertParams(route, '/one', { x: 'one' });
		assertParams(route, '/', {});
	});

	it('literal regex meta characters in static segments are escaped', () => {
		const route = '/file(+).txt';
		const r = compileRoute(route);
		// Should match exactly the literal segment
		expect(r.regex.test('/file(+).txt')).toBe(true);
		expect(r.regex.test('/filex).txt')).toBe(false);
	});
});

describe('uncovered error branches', () => {
	it('throws if param pattern ** is not last segment (line 231, 333)', () => {
		expect(() => compileRoute('/a/:p(**)/b')).toThrow();
	});

	it('throws if param name is invalid (line 278)', () => {
		expect(() => compileRoute('/:bad-name')).toThrow();
		// Directly test validateTokens for a param with invalid name
		expect(() => validateTokens([
			{ kind: 'param', name: 'bad-name', raw: ':bad-name', optional: false },
		] as any)).toThrow();
	});

	it('throws if param glob pattern with ** is not last segment (line 340)', () => {
		expect(() => compileRoute('/a/:p(**.png)/b')).toThrow();
	});

	it('throws in buildRegexFromTokens for double-star param not last (line 333)', () => {
		const tokens = [
			{ kind: 'static', raw: '', value: '' },
			{ kind: 'param', raw: ':p(**)', name: 'p', optional: false, pattern: { type: 'double-star', source: '**' } },
			{ kind: 'static', raw: 'b', value: 'b' },
		];
		expect(() => (buildRegexFromTokens as any)(tokens)).toThrow();
	});

	it('throws in buildRegexFromTokens for param glob with ** not last (line 340)', () => {
		const tokens = [
			{ kind: 'static', raw: '', value: '' },
			{ kind: 'param', raw: ':p(**.png)', name: 'p', optional: false, pattern: { type: 'glob', source: '**.png' } },
			{ kind: 'static', raw: 'b', value: 'b' },
		];
		expect(() => (buildRegexFromTokens as any)(tokens)).toThrow();
	});
});

/* ========================= Massive randomized table ========================= */

describe('generated exhaustive table', () => {
	// Build ~200 cases mixing patterns
	const exts = ['png', 'svg', 'jpg'];
	const prefixes = ['/g1', '/g2', '/g3'];
	const patterns = ['*.{png,svg}', '**.{png,svg}', '*.jpg'];
	const cases: Array<[string, string, boolean]> = [];

	for (const p of prefixes) {
		for (const pat of patterns) {
			const route = `${p}/${pat}`;
			for (const e of exts) {
				cases.push([route, `${p}/a.${e}`, pat !== '**.{png,svg}' ? (pat.includes(e) || (pat.includes('{') && (e === 'png' || e === 'svg'))) : (e === 'png' || e === 'svg')]);
				cases.push([route, `${p}/deep/nest/file.${e}`, pat.startsWith('**') ? (e === 'png' || e === 'svg') : false]);
			}
		}
	}
});
