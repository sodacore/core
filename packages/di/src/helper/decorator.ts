/**
 * Set meta data against a class, or a class's property, use as a higher-order
 * function, where the first call is for the key, namespace and prefix options,
 * and the return function is for the target, value and property key.
 * @example setMeta('key', 'namespace')(target, value, propertyKey);
 * @param key The key to store the metadata under.
 * @param namespace [Optional] namespace for meta key.
 * @param noPrefix Whether to prefix the key with `@sodacore` [default: false].
 * @returns (target: any, value: any, propertyKey?: string | symbol) => void
 */
export function setMeta(key: string, namespace?: string, noPrefix = false) {
	return (target: any, value: any, propertyKey?: string | symbol) => {
		const metaKey = getMetaPrefix(key, namespace, noPrefix);
		if (!Reflect.hasMetadata(metaKey, target)) {
			if (propertyKey) Reflect.defineMetadata(metaKey, value, target, propertyKey);
			else Reflect.defineMetadata(metaKey, value, target);
		}
	};
}

/**
 * Get's meta data from a class, or a class's property, use as a higher-order
 * function, where the first call is for the key, namespace and prefix options,
 * and the return function is for the target, value and property key, is a generic
 * so you can pass a type as a return.
 * @example getMeta<string>('key', 'namespace')(target, propertyKey, value);
 * @param key The key to store the metadata under.
 * @param namespace [Optional] namespace for meta key.
 * @param noPrefix Whether to prefix the key with `@sodacore` [default: false].
 * @returns (target: any, value: any, propertyKey?: string | symbol) => void
 */
export function getMeta<T = any | undefined>(key: string, namespace?: string, noPrefix = false) {
	return (target: any, propertyKey?: string | symbol, fallback?: T) => {
		const metaKey = getMetaPrefix(key, namespace, noPrefix);
		if (propertyKey) return <T>Reflect.getMetadata(metaKey, target, propertyKey) ?? fallback as T;
		return <T>Reflect.getMetadata(metaKey, target) ?? fallback as T;
	};
}

/**
 * Will prefix a key by connecting the namespace and key together via colon,
 * and optionally prefixing the key with `@sodacore`.
 * @param key The key to prefix.
 * @param namespace Optional namespace.
 * @param noPrefix Whether to prefix the key with `@sodacore` [default: false].
 * @returns string
 */
export function getMetaPrefix(key: string, namespace?: string, noPrefix = false) {
	if (noPrefix) return `${namespace ? `${namespace}:` : ''}${key}`;
	return `@sodacore:${namespace ? `${namespace}:` : ''}${key}`;
}
