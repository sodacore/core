import { Utils } from '@sodacore/core';

export default class Element {
	protected component = 'Unknown';
	protected attributes: Record<string, string> = {};
	protected classes: string[] = [];
	protected styles: Record<string, string> = {};
	protected key: string;

	public constructor(key: string) {
		this.key = key;
	}

	public setKey(key: string) {
		this.key = key;
	}

	public getKey() {
		return this.key;
	}

	public setComponent(component: string) {
		this.component = component;
	}

	public getComponent() {
		return this.component;
	}

	public addClass(className: string) {
		this.classes.push(className);
	}

	public removeClass(className: string) {
		this.classes = this.classes.filter(c => c !== className);
	}

	public getClasses() {
		return this.classes;
	}

	public setStyle(styleName: string, value: string) {
		this.styles[styleName] = value;
	}

	public removeStyle(styleName: string) {
		delete this.styles[styleName];
	}

	public getStyle(styleName: string) {
		return this.styles[styleName];
	}

	public getStyles() {
		return this.styles;
	}

	public setAttribute(attributeName: string, value: string) {
		this.attributes[attributeName] = value;
	}

	public removeAttribute(attributeName: string) {
		delete this.attributes[attributeName];
	}

	public getAttribute(attributeName: string) {
		return this.attributes[attributeName];
	}

	public getAttributes() {
		return this.attributes;
	}

	public toJSON() {
		return {
			key: this.key,
			styles: this.styles,
			classes: this.classes,
			component: this.component,
			attributes: this.attributes,
		};
	}

	public toHTML() {
		return Utils.stripIndent(/* html */`
			<p
				classes="${this.classes.join(' ')}"
				style="${Object.entries(this.styles).map(([k, v]) => `${k}: ${v};`).join(' ')}"
				${Object.entries(this.attributes).map(([k, v]) => `${k}="${v}"`).join(' ')}
			>
				Default Element <br />
				<em>Either you, or a library author has forgotten to set the correct component for this element.</em>
			</p>
		`);
	}
}
