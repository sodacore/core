import type BaseElement from './base';
import Layout from './layout';

export default class Page {
	protected layout = new Layout();
	protected elements: BaseElement[] = [];

	public constructor(
		protected title: string,
	) {}

	public setTitle(title: string) {
		this.title = title;
		return this;
	}

	public getTitle() {
		return this.title;
	}

	public setLayout(layout: Layout) {
		this.layout = layout;
		return this;
	}

	public getLayout() {
		return this.layout;
	}

	public addElement(element: BaseElement) {
		this.elements.push(element);
		return this;
	}

	public addElements(...elements: BaseElement[]) {
		this.elements.push(...elements);
		return this;
	}

	public removeElement(element: BaseElement) {
		this.elements = this.elements.filter(e => e !== element);
		return this;
	}

	public getElements() {
		return this.elements;
	}

	public getElement(key: string) {
		return this.elements.find(element => element.getKey() === key);
	}

	public toJSON() {
		return {
			title: this.title,
			layout: this.layout.toJSON(),
			elements: this.elements.map(element => element.toJSON()),
		};
	}
}
