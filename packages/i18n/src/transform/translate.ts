import type { IConfig } from '../types';
import { Registry } from '@sodacore/registry';
import { getBestLocale } from '../helper/utils';
import I18nProvider from '../provider/i18n';

export default async function TranslateTransform(
	context: any,
	response: any,
) {
	// Get the accepted languages from the request headers.
	const config = Registry.get<IConfig>('@i18n:config');
	const request = context.getRequest();
	const headers = request.headers || {};
	const url = new URL(request.url);
	const overrideLocale = url.searchParams.get(config.overrideGetParam ?? 'locale');
	const acceptLocale = config.overrideGetParam
		? overrideLocale
		: headers['accept-language'] || headers['Accept-Language'] || 'en-GB';

	// Get the translatior.
	const translator = Registry.get<I18nProvider>(I18nProvider.name);
	const availableLanguages = await translator.getAvailableLanguages();
	const bestLocale = getBestLocale(acceptLocale, availableLanguages);

	// If no available language code is found, or the response is not a string or object,
	if (
		!bestLocale
		|| (
			typeof response !== 'string'
			&& typeof response !== 'object'
		)
	) {
		return response;
	}

	// If the response is of type response, return as is.
	if (response instanceof Response) return response;

	// If the response is a string or object, we will transform it.
	return await translator.autoTranslate(response, bestLocale);
}
