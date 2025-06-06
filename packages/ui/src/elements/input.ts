import BaseElement from './base';

export default class Input extends BaseElement {
	public onChange(callback: (value: string) => void) {
		console.log(callback);
	}
}
