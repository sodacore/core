import { IconFamily, type IconVariant } from './types';
import { mergeStyles, toStyles } from '../../helper/element';
import Element from '../element/element';
import { Utils } from '@sodacore/core';

export default class Icon extends Element {
	protected component = 'wa-icon';
	protected name?: string;
	protected label?: string;
	protected library?: string;
	protected variant?: IconVariant;
	protected autoWidth = false;
	protected swapOpacity = false;
	protected family: IconFamily = IconFamily.Solid;

	public setName(name: string) {
		this.name = name;
		return this;
	}

	public getName() {
		return this.name;
	}

	public setLabel(label: string) {
		this.label = label;
		return this;
	}

	public getLabel() {
		return this.label;
	}

	public setLibrary(library: string) {
		this.library = library;
		return this;
	}

	public getLibrary() {
		return this.library;
	}

	public setVariant(variant: IconVariant) {
		this.variant = variant;
		return this;
	}

	public getVariant() {
		return this.variant;
	}

	public setAutoWidth(autoWidth = true) {
		this.autoWidth = autoWidth;
		return this;
	}

	public getAutoWidth() {
		return this.autoWidth;
	}

	public setSwapOpacity(swapOpacity = true) {
		this.swapOpacity = swapOpacity;
		return this;
	}

	public getSwapOpacity() {
		return this.swapOpacity;
	}

	public setFamily(family: IconFamily) {
		this.family = family;
		return this;
	}

	public getFamily() {
		return this.family;
	}

	public setSize(size: string) {
		this.setStyle('font-size', size);
		return this;
	}

	public getSize() {
		return this.getStyle('font-size');
	}

	public setDuotoneColours(design: {
		primary?: string,
		primaryOpacity?: number,
		secondary?: string,
		secondaryOpacity?: number,
	}) {
		if (typeof design.primary !== 'undefined') this.styles['--primary-color'] = design.primary;
		if (typeof design.primaryOpacity !== 'undefined') this.styles['--primary-opacity'] = String(design.primaryOpacity);
		if (typeof design.secondary !== 'undefined') this.styles['--secondary-color'] = design.secondary;
		if (typeof design.secondaryOpacity !== 'undefined') this.styles['--secondary-opacity'] = String(design.secondaryOpacity);
		return this;
	}

	public toJSON() {
		const parent = super.toJSON();
		return {
			...parent,
			name: this.name,
			label: this.label,
			family: this.family,
			variant: this.variant,
			library: this.library,
			component: this.component,
			autoWidth: this.autoWidth,
			swapOpacity: this.swapOpacity,
			styles: mergeStyles(parent.styles, this.getStyles()),
		};
	}

	public toHTML() {
		return Utils.stripIndent(/* html */`
			<wa-icon
				name="${this.name}"
				family="${this.family}"
				label="${this.label}"
				style="${toStyles(this.getStyles())}"
				class="${this.getClasses().join(' ')}"
				${this.autoWidth ? 'auto-width' : ''}
				${this.swapOpacity ? 'swap-opacity' : ''}
				${this.library ? `library="${this.library}"` : ''}
				${this.variant ? `variant="${this.variant}"` : ''}
			></wa-icon>
		`);
	}
}
