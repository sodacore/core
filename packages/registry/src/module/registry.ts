/**
 * A simple registry for storing and retrieving values by key, please
 * note that the Registry is globalised so that all packages using this
 * library will use the same registry, this is to allow for cross-package
 * communication and data sharing.
 * @example `Registry.set('myKey', 'myValue');`
 * @example `Registry.get<string>('myKey');`
 * @class Registry
 * @static
 */
class Registry {
	private static registry = new Map<string, any>();
	private static debug = false;

	public static setDebug(debug: boolean) {
		this.debug = debug;
	}

	/**
	 * Will set a key and value in the registry, if the key already exists
	 * it will throw an error, unless the overwrite flag is set to true.
	 * @param key The key to store the value against.
	 * @param value The value to store.
	 * @param overwrite Whether to overwrite the value if it already exists [default: false].
	 * @static
	 */
	public static set(key: string, value: any, overwrite = false) {
		if (this.debug) console.log('Registry.set', key, value, overwrite);
		if (this.registry.has(key) && !overwrite) {
			throw new Error(`Registry key already exists: ${key}`);
		}
		this.registry.set(key, value);
	}

	/**
	 * Will get a value from the registry by key, if the key does not exist
	 * it will return undefined.
	 * @param key The key to get the value for.
	 * @returns T [default: any]
	 * @static
	 */
	public static get<T = any>(key: string) {
		if (this.debug) console.log('Registry.get', key);
		return <T> this.registry.get(key);
	}

	/**
	 * Will check if the registry has a key.
	 * @param key The key to check for.
	 * @returns boolean
	 * @static
	 */
	public static has(key: string) {
		if (this.debug) console.log('Registry.has', key);
		return this.registry.has(key);
	}

	/**
	 * Will remove a key from the registry.
	 * @param key The key to remove.
	 * @static
	 */
	public static remove(key: string) {
		if (this.debug) console.log('Registry.remove', key);
		this.registry.delete(key);
	}

	/**
	 * Will return an array of keys in the registry.
	 * @returns string[]
	 * @static
	 */
	public static keys() {
		return Array.from(this.registry.keys());
	}

	/**
	 * Will clear all values of the registry.
	 * @static
	 */
	public static clear() {
		this.registry.clear();
	}

	/**
	 * Will search for keys in the registry, if a query is provided
	 * it will only return keys that match the query.
	 * @param query An optional query to search for.
	 * @returns string[]
	 * @static
	 */
	public static search(query?: string) {
		if (this.debug) console.log('Registry.search', query);
		const results: string[] = [];
		for (const key of this.registry.keys()) {
			if (query && !key.includes(query)) continue;
			results.push(key);
		}
		return results;
	}

	/**
	 * Will return an array of all values in the registry.
	 * @returns any[]
	 * @static
	 */
	public static all() {
		return Array.from(this.registry.values());
	}

	/**
	 * Will export the registry as a plain object, can be imported
	 * to other registries, will export keys and values that CAN be
	 * converted, modules and injection references will be lost.
	 * @returns Record<string, any>
	 * @static
	 */
	public static export() {
		const seen: any[] = [];
		return JSON.stringify(Object.fromEntries(this.registry), (_key: string, val: any) => {
			if (val !== null && typeof val === 'object') {
				if (seen.includes(val)) return;
				seen.push(val);
			}
			return val;
		});
	}

	/**
	 * Will import a plain object into the registry, will overwrite
	 * any existing keys with the same name.
	 * @param data The exported registry data.
	 * @static
	 */
	public static import(data: Record<string, any>) {
		for (const key in data) {
			this.registry.set(key, data[key]);
		}
	}
}

// Globalisation logic.
const existing = <typeof Registry>(<any>globalThis)['@sodacore:registry'];
if (!existing) (<any>globalThis)['@sodacore:registry'] = Registry;
export default existing ?? Registry;
