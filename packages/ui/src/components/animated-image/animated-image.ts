import type Icon from '../icon/icon';
import Element from '../element/element';
import { Utils } from '@sodacore/core';

export default class AnimatedImage extends Element {
	protected component = 'wa-animated-image';
	protected src?: string;
	protected alt?: string;
	protected play = false;
	protected playIcon?: Icon;
	protected pauseIcon?: Icon;

	public setPlayIcon(icon: Icon, callback: (element: Icon) => void) {
		callback(icon);
		this.playIcon = icon;
		return this;
	}

	public getPlayIcon() {
		return this.playIcon;
	}

	public setPauseIcon(icon: Icon, callback: (element: Icon) => void) {
		callback(icon);
		this.pauseIcon = icon;
		return this;
	}

	public getPauseIcon() {
		return this.pauseIcon;
	}

	public setSource(src: string) {
		this.src = src;
		return this;
	}

	public getSource() {
		return this.src;
	}

	public setAlt(alt: string) {
		this.alt = alt;
		return this;
	}

	public getAlt() {
		return this.alt;
	}

	public setPlay(play: boolean) {
		this.play = play;
		return this;
	}

	public getPlay() {
		return this.play;
	}

	public setControlBoxSize(size: string) {
		this.setStyle('--control-box-size', size);
		return this;
	}

	public getControlBoxSize() {
		return this.styles['--control-box-size'];
	}

	public toJSON() {
		const parent = super.toJSON();
		return {
			...parent,
			component: this.component,
			src: this.src,
			alt: this.alt,
			play: this.play,
		};
	}

	public toHTML() {
		return Utils.stripIndent(/* html */`
			<wa-animated-image
				src="${this.src}"
				alt="${this.alt || ''}"
				${this.play ? 'play' : ''}
			></wa-animated-image>
		`);
	}
}
