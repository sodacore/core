export function toAttributes(attributes: Record<string, any>) {
	return Object.entries(attributes)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ');
}

export function toStyles(styles: Record<string, any>) {
	return Object.entries(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
}

export function mergeStyles(styles: Record<string, string | number>, ...additionalStyles: Record<string, string | number>[]) {
	const merged: Record<string, any> = {};

	Object.entries(styles).forEach(([key, value]) => {
		merged[key] = value;
	});

	additionalStyles.forEach(styleObj => {
		Object.entries(styleObj).forEach(([key, value]) => {
			merged[key] = value;
		});
	});

	return merged;
};
