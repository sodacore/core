import { setMeta } from '../helper/decorator';

/**
 * Defines the class as injectable, this means, that it will be
 * processed by the injector wrapper before it is called, and
 * will check for any modules it may need to resolve ahead of time.
 * @warning Dependency injection is only used for methods, not constructors, use `@Inject()` for that, due to it being lazy.
 * @example `@Injectable();`
 * @returns ClassDecorator
 */
export default function Injectable() {
	return (target: any) => {
		setMeta('injectable', 'di')(target, true);

		const methods = Reflect.ownKeys(target.prototype).filter(key => key !== 'constructor');
		for (const method of methods) {
			const originalMethod = target.prototype[method];
			Object.defineProperty(target.prototype, method, {
				enumerable: true,
				configurable: true,
				writable: true,
				value(...args: any[]) {
					console.log(`Called ${String(method)} with args: `, args);
					return originalMethod.apply(this, args);
				},
			});
		}
	};
}
