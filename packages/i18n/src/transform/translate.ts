import { Registry } from '@sodacore/registry';
import { REGEX_TRANSLATION_TAG, REGEX_TRANSLATION_TAG_QUERY } from '../helper/constants';
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

	// Get accepted translation language.
	const translate = (text: string) => {

		// Define the text.
		let data = text;

		// Get the matches.
		const matches = data.match(REGEX_TRANSLATION_TAG);
		if (!matches) return data;

		// Loop each match.
		matches.forEach(match => {
			const query = match.replace(REGEX_TRANSLATION_TAG_QUERY, '$1').trim();
			const translated = availableLanguageCode
				? translator.translate(query, availableLanguageCode, query)
				: query;
			data = data.replace(match, translated);
		});

		// Return the translated text.
		return data;
	};

	// Transform: String
	if (typeof response === 'string') {
		translate(response);
	}

	// Transform: Object (Recursive)
	if (typeof response === 'object') {
		const _transform = (item: any) => {
			if (typeof item === 'object' && !Array.isArray(item)) {
				for (const key in item) {
					if (typeof item[key] === 'string') {
						item[key] = translate(item[key]);
					} else if (typeof item[key] === 'object') {
						_transform(item[key]);
					}
				}
			} else if (Array.isArray(item)) {
				item.forEach((element, index) => {
					if (typeof element === 'string') {
						item[index] = translate(element);
					} else if (typeof element === 'object') {
						_transform(element);
					}
				});
			}
		};

		_transform(response);
	}

	return response;
}
