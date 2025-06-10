import type { IConfig } from '../types';
import { Inject, Provide } from '@sodacore/di';
import I18nService from '../service/i18n';
import { REGEX_TRANSLATION_TAG, REGEX_TRANSLATION_TAG_QUERY } from '../helper/constants';

@Provide()
export default class I18nProvider {
	@Inject('@i18n:config') private config?: IConfig;
	@Inject() private i18nService!: I18nService;
	private defaultLanguage = this.config?.defaultLocale || null;

	public t(query: string, languageCode: string, fallback?: string) {
		return this.translate(query, languageCode, fallback);
	}

	public translate(query: string, languageCode: string, fallback?: string) {
		if (!this.i18nService.hasTranslations()) return fallback ?? query;
		return this.i18nService.translate(query, languageCode ?? this.config?.defaultLocale, fallback);
	}

	public autoTranslate(data: string | Array<any> | Record<string, any>, languageCode: string) {
		if (typeof data === 'string') {
			return this.autoTranslateText(data, languageCode);
		} else if (typeof data === 'object') {

			// Deep clone to avoid mutating original data.
			const original = JSON.parse(JSON.stringify(data));

			// Recursive function to transform the object or array.
			const _transform = (item: any) => {
				if (typeof item === 'object' && !Array.isArray(item)) {
					for (const key in item) {
						if (typeof item[key] === 'string') {
							item[key] = this.autoTranslateText(item[key], languageCode);
						} else if (typeof item[key] === 'object') {
							_transform(item[key]);
						}
					}
				} else if (Array.isArray(item)) {
					item.forEach((element, index) => {
						if (typeof element === 'string') {
							item[index] = this.autoTranslateText(element, languageCode);
						} else if (typeof element === 'object') {
							_transform(element);
						}
					});
				}
			};

			// Transform the response and return.
			_transform(original);
			return original;
		}
	}

	public autoTranslateText(query: string, languageCode: string) {

		// Get the matches, if none, return the query.
		const matches = this.getTranslateMatches(query);
		if (matches.length === 0) return query;

		// Set the data as the query.
		let data = String(query);

		// Loop the matches and trigger the translate.
		matches.forEach(match => {
			const text = match.token;
			const translated = languageCode
				? this.translate(text, languageCode, text)
				: text;
			data = data.replaceAll(match.inner, translated);
		});

		// Return the translated text.
		return data;
	}

	public getTranslateMatches(query: string) {

		// Get the matches.
		const matches = query.match(REGEX_TRANSLATION_TAG);
		if (!matches) return [];

		// Return the matches.
		return matches.map(match => ({
			token: match.replace(REGEX_TRANSLATION_TAG_QUERY, '$1').trim(),
			inner: match,
		}));
	}

	public getAvailableTranslation(acceptedLanguages: string) {

		// If no translations, then return the default language.
		if (!this.i18nService.hasTranslations()) return null;

		// Collect the accepted languages.
		const languages = acceptedLanguages.split(',').map(item => {
			const [lang, priority] = item.split(';');
			if (priority && priority.startsWith('q=')) {
				return { code: lang.trim(), priority: Number.parseFloat(priority.split('=')[1]) };
			}
			return { code: lang.trim(), priority: 1.0 }; // Default priority if not specified.
		});

		// Get the available languages.
		const availableLanguages = this.i18nService.getAvailableLanguages(true);
		if (availableLanguages.length === 0) return null;

		// Find the best match based on priority.
		const bestMatch = languages.reduce((best, current) => {
			const langCode = current.code;
			const hasLanguage = availableLanguages.includes(langCode);
			if (this.defaultLanguage) {
				if (!hasLanguage && langCode === this.defaultLanguage) {
					return current; // Allow the default language to be selected.
				}
			}
			if (hasLanguage && (!best || current.priority > best.priority)) {
				return current; // Update best match if current has a higher priority.
			}
			return best; // Return the best match found so far.
		}, { code: 'en-GB', priority: 0 });

		// Return.
		if (!bestMatch) return null;
		return this.defaultLanguage
			? bestMatch.code === this.defaultLanguage
				? null
				: bestMatch.code
			: bestMatch.code;
	}
}
