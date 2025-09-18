import { describe, expect, it } from 'bun:test';
import { parseCommand, parseValue, toCamelCase } from './utils'; // adjust path

describe('helper/utils: parseCommand', () => {
	it('throws an error when not enough arguments are provided', () => {
		expect(() => parseCommand(['workspace'])).toThrow('Not enough arguments to parse.');
	});

	it('parses combined short flags', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'-abc',
			'bun',
			'run',
			'build',
		]);

		expect(result).toEqual({
			namespace: 'workspace',
			command: 'foreach',
			parameters: ['bun', 'run', 'build'],
			flags: {
				a: true,
				b: true,
				c: true,
			},
			_: ['bun', 'run', 'build'],
		});
	});

	it('parses single short flag without value', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'-z',
			'param1',
		]);

		expect(result.flags.z).toBe(true);
		expect(result.parameters).toEqual(['param1']);
	});

	it('handles parameters with no flags at all', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'bun',
			'run',
		]);

		expect(result.flags).toEqual({});
		expect(result.parameters).toEqual(['bun', 'run']);
	});

	it('parses long flags with values', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'--hello1=asfasf',
			'bun',
		]);

		expect(result.flags.hello1).toBe('asfasf');
	});

	it('parses long flags without values as true', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'--hello2',
			'bun',
		]);

		expect(result.flags.hello2).toBe(true);
	});

	it('parses short flag with value', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'-x=123',
		]);

		expect(result.flags.x).toBe(123);
	});

	it('handles mixed flags and parameters', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'-abc',
			'--hello1=asfasf',
			'--hello2',
			'bun',
			'run',
			'build',
		]);

		expect(result).toEqual({
			namespace: 'workspace',
			command: 'foreach',
			parameters: ['bun', 'run', 'build'],
			flags: {
				a: true,
				b: true,
				c: true,
				hello1: 'asfasf',
				hello2: true,
			},
			_: ['bun', 'run', 'build'],
		});
	});

	it('parses booleans and numbers correctly', () => {
		const result = parseCommand([
			'workspace',
			'foreach',
			'--bool=true',
			'--num=42',
		]);

		expect(result.flags.bool).toBe(true);
		expect(result.flags.num).toBe(42);
	});
});

describe('parseValue', () => {
	it('parses true/false strings into booleans', () => {
		expect(parseValue('true')).toBe(true);
		expect(parseValue('false')).toBe(false);
	});

	it('parses numeric strings into numbers', () => {
		expect(parseValue('42')).toBe(42);
		expect(parseValue('3.14')).toBe(3.14);
	});

	it('returns original string if not number or boolean', () => {
		expect(parseValue('hello')).toBe('hello');
	});

	it('returns empty string if value is empty', () => {
		expect(parseValue('')).toBe('');
	});
});

describe('toCamelCase', () => {
	it('converts kebab-case to camelCase', () => {
		expect(toCamelCase('my-flag-name')).toBe('myFlagName');
		expect(toCamelCase('alreadyCamel')).toBe('alreadyCamel');
	});

	it('handles single word without changes', () => {
		expect(toCamelCase('simple')).toBe('simple');
	});
});
