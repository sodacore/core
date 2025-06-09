import { Registry } from '@sodacore/registry';
import I18nProvider from '../provider/i18n';

export default function TranslateTransform(
	context: any,
	response: any,
) {
	// Get the accepted languages from the request headers.
	const request = context.getRequest();
	const headers = request.headers || {};
	const acceptLanguage: string = headers.get('accept-language') ?? 'en-GB';

	// Get the translatior.
	const translator = Registry.get<I18nProvider>(I18nProvider.name);
	const availableLanguageCode = translator.getAvailableTranslation(acceptLanguage);

	// If no available language code is found, or the response is not a string or object,
	if (
		!availableLanguageCode
		|| (
			typeof response !== 'string'
			&& typeof response !== 'object'
		)
	) {
		return response;
	}

	// If the response is a string or object, we will transform it.
	return translator.autoTranslate(response, availableLanguageCode);
}
