export default class BaseElement {
	protected component = 'text';
	protected key: string | null = null;
	protected area: string | null = null;
	protected classes: string[] = [];
	protected styles: Record<string, string> = {};
	protected attributes: Record<string, string> = {};
	protected value: string | null = null;

	public constructor(
		protected label?: string,
	) {}

	public setKey(key: string) {
		this.key = key;
		return this;
	}

	public getKey() {
		return this.key;
	}

	public setLabel(label: string) {
		this.label = label;
		return this;
	}

	public getLabel() {
		return this.label;
	}

	public setArea(area: string) {
		this.area = area;
		return this;
	}

	public getArea() {
		return this.area;
	}

	public addClass(className: string) {
		this.classes.push(className);
		return this;
	}

	public removeClass(className: string) {
		this.classes = this.classes.filter(c => c !== className);
		return this;
	}

	public hasClass(className: string) {
		return this.classes.includes(className);
	}

	public setClasses(classes: string[]) {
		this.classes = classes;
		return this;
	}

	public getClasses() {
		return this.classes;
	}

	public addStyle(key: string, value: string) {
		this.styles[key] = value;
		return this;
	}

	public removeStyle(key: string) {
		delete this.styles[key];
		return this;
	}

	public hasStyle(key: string) {
		return key in this.styles;
	}

	public setStyles(styles: Record<string, string>) {
		this.styles = styles;
		return this;
	}

	public getStyles() {
		return this.styles;
	}

	public addAttribute(key: string, value: string) {
		this.attributes[key] = value;
		return this;
	}

	public removeAttribute(key: string) {
		delete this.attributes[key];
		return this;
	}

	public hasAttribute(key: string) {
		return key in this.attributes;
	}

	public setAttributes(attributes: Record<string, string>) {
		this.attributes = attributes;
		return this;
	}

	public getAttributes() {
		return this.attributes;
	}

	public setValue(value: string) {
		this.value = value;
		return this;
	}

	public getValue() {
		return this.value;
	}

	public toJSON() {
		return {
			component: this.component,
			key: this.key ?? '',
			area: this.area ?? null,
			label: this.label ?? '',
			classes: this.classes,
			styles: this.styles,
			attributes: this.attributes,
			value: this.value ?? null,
		};
	}
}
