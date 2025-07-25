import type { IConfig, IParsedLanguage, IQuery } from '../types';
import { Inject, Provide } from '@sodacore/di';
import I18nService from '../service/i18n';
import { REGEX_TRANSLATION_TAG, REGEX_TRANSLATION_TAG_QUERY } from '../helper/constants';

@Provide()
export default class I18nProvider {
	@Inject('@i18n:config') private config?: IConfig;
	@Inject() private i18nService!: I18nService;

	public parseLocaleHeader(acceptedLanguages: string) {
		return acceptedLanguages
			.split(',')
			.map(part => {
				const [locale, qValue] = part.trim().split(';q=');
				const [language, region] = locale.trim().split('-');
				return {
					locale: locale.trim(),
					quality: qValue ? Number.parseFloat(qValue) : 1.0,
					language: language.toLowerCase(),
					region: region?.toUpperCase(),
				};
			})
			.sort((a, b) => b.quality - a.quality);
	}

	private scoreLocaleMatch(requested: IParsedLanguage, supported: string): number {
		const [supportedLang, supportedRegion] = supported.split('-');
		const languageMatches = requested.language === supportedLang.toLowerCase();
		const regionMatches = requested.region === supportedRegion?.toUpperCase();

		if (languageMatches && regionMatches) return 100;
		if (languageMatches && requested.region) return 80; // specific region requested, different matched
		if (languageMatches && !requested.region) return 60; // language-only match

		return 0;
	}

	public getBestLocale(acceptLanguageHeader: string): string {
		const parsedLanguages = this.parseLocaleHeader(acceptLanguageHeader);
		let bestMatch: { locale: string, score: number } | null = null;

		for (const requested of parsedLanguages) {
			for (const supported of this.i18nService.getAvailableLanguages()) {
				const score = this.scoreLocaleMatch(requested, supported) * requested.quality;

				if (!bestMatch || score > bestMatch.score) {
					bestMatch = { locale: supported, score };
				}
			}
		}

		return bestMatch?.locale || this.config?.defaultLocale || 'en-GB';
	}

	public t(query: string, languageCode: string, fallback?: string) {
		return this.translate(query, languageCode, fallback);
	}

	public translate(query: string, languageCode: string, fallback?: string) {
		return this.i18nService.translate(query, languageCode ?? this.config?.defaultLocale, fallback);
	}

	public translateMultiple(queries: IQuery[], languageCode: string) {
		return this.i18nService.translateMultiple(
			queries,
			languageCode ?? this.config?.defaultLocale,
		);
	}

	public autoTranslate(response: string | Array<any> | Record<string, any>, languageCode: string) {
		const isObject = typeof response === 'object';
		const value = isObject ? JSON.stringify(response) : response;

		// Get the matches, if none, return the query.
		const matches = this.getTranslateMatches(value);
		if (matches.length === 0) return value;

		// Set the data as the query.
		let data = String(value);

		// Define the items to translate.
		const itemsToTranslate: IQuery[] = matches.map(match => {
			return {
				original: match.token,
				value: match.inner,
			};
		});

		// Now pass this to the translateMultiple method.
		const translatedItems = this.translateMultiple(itemsToTranslate, languageCode);

		// Loop the matches and replace the translated text.
		translatedItems.forEach(item => {
			data = data.replaceAll(item.original, item.translated || item.value || item.original);
		});

		// Return the translated text.
		return isObject ? JSON.parse(data) : data;
	}

	public getTranslateMatches(query: string) {

		// Get the matches.
		const matches = query.match(REGEX_TRANSLATION_TAG);
		if (!matches) return [];

		// Return the matches.
		return matches.map(match => ({
			token: match,
			inner: match.replace(REGEX_TRANSLATION_TAG_QUERY, '$1').trim(),
		}));
	}
}
