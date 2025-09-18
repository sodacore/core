/**
 * Catch response type.
 */
export type CatchResponseType = 'error' | 'custom' | 'null' | 'false' | 'undefined' | 'function';

/**
 * This method wraps any method and any caught errors will then be returned
 * to the calling function, makes the code prettier instead of calling try;
 * catch in every function.
 *
 * Please note you will need to make sure your method will return either the
 * expected return type or an `Error`.
 *
 * @param response [optional] The response type if function fails, default: error.
 * @param customResponse [optional] A custom response to return instead.
 * @returns Function
 */
export default function Catch(response: CatchResponseType = 'error', customResponse?: unknown): MethodDecorator {
	return (_ignore1: any, _ignore2: string | symbol, descriptor: PropertyDescriptor): void => {
		const originalMethod = descriptor.value;
		descriptor.value = function(...args: Array<any>) {
			try {
				return originalMethod.apply(this, args);
			} catch (err) {
				if (response === 'false') return false;
				if (response === 'null') return null;
				if (response === 'undefined') return;
				if (response === 'error') return err;
				if (response === 'custom' && typeof customResponse !== 'undefined') return customResponse;
				if (response === 'function') {
					if (typeof customResponse !== 'function') {
						throw new TypeError('@Catch was set to function return, but no valid function was given.');
					}
					return customResponse(err);
				}
				return err;
			}
		};
	};
}
