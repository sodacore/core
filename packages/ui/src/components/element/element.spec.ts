import { describe, expect, it } from 'bun:test';
import Element from './element';

describe('Element', () => {
	it('toJSON returns correct structure after setting properties', () => {
		const el = new Element('test-key');
		el.setComponent('div');
		el.addClass('foo');
		el.addClass('bar');
		el.setStyle('color', 'red');
		el.setStyle('margin', '10px');
		el.setAttribute('data-id', '123');
		el.setAttribute('role', 'button');
		const json = el.toJSON();
		expect(json).toEqual({
			key: 'test-key',
			component: 'div',
			classes: ['foo', 'bar'],
			styles: { color: 'red', margin: '10px' },
			attributes: { 'data-id': '123', 'role': 'button' },
		});
	});

	it('toHTML returns correct HTML with set properties', () => {
		const el = new Element('html-key');
		el.setComponent('span');
		el.addClass('alpha');
		el.setStyle('background', 'blue');
		el.setAttribute('title', 'Hello');
		const html = el.toHTML();
		expect(html).toContain('classes="alpha"');
		expect(html).toContain('style="background: blue;"');
		expect(html).toContain('title="Hello"');
		expect(html).toContain('Default Element');
		expect(html).toContain('Either you, or a library author has forgotten to set the correct component for this element.');
	});

	it('toJSON and toHTML reflect removal of class, style, and attribute', () => {
		const el = new Element('remove-key');
		el.addClass('remove-me');
		el.setStyle('font-size', '12px');
		el.setAttribute('aria-label', 'label');
		el.removeClass('remove-me');
		el.removeStyle('font-size');
		el.removeAttribute('aria-label');

		const json = el.toJSON();
		expect(json.classes).toEqual([]);
		expect(json.styles).toEqual({});
		expect(json.attributes).toEqual({});

		const html = el.toHTML();
		expect(html).toContain('classes=""');
		expect(html).toContain('style=""');
	});

	it('getKey and setKey work as expected', () => {
		const el = new Element('initial-key');
		expect(el.getKey()).toBe('initial-key');
		el.setKey('new-key');
		expect(el.getKey()).toBe('new-key');
	});
});
