import { Inject, Provide } from '@sodacore/di';
import I18nService from '../service/i18n';
import type { IQuery } from '../types';
import { REGEX_TRANSLATION_TAG, REGEX_TRANSLATION_TAG_QUERY } from '../helper/constants';
import { getBestLocale } from '../helper/utils';

@Provide()
export default class I18nProvider {
	@Inject() private i18nService!: I18nService;

	public async getBestLocale(acceptedLanguage: string) {
		const availableLanguages = await this.getAvailableLanguages();
		return getBestLocale(acceptedLanguage, availableLanguages);
	}

	public async getAvailableLanguages() {
		const lookups = this.i18nService.getLookups();
		const availableLanguages: string[] = [];
		for (const lookup of lookups) {
			const langs = await lookup.getAvailableLanguages();
			if (langs && Array.isArray(langs)) {
				availableLanguages.push(...langs);
			}
		}
		return availableLanguages;
	}

	public async translate(locale: string, query: string, fallback?: string) {
		const lookups = this.i18nService.getLookups();
		for (const lookup of lookups) {
			if (await lookup.supports(locale)) {
				return await lookup.onTranslate(query, locale, fallback);
			}
		}
		return fallback ?? query;
	}

	public async batchTranslate(locale: string, queries: IQuery[]) {
		const lookups = this.i18nService.getLookups();
		for (const lookup of lookups) {
			if (await lookup.supports(locale)) {
				return await lookup.onTranslateMultiple(queries, locale);
			}
		}
		return queries.map(query => ({
			...query,
			translated: query.value || query.original,
		}));
	}

	public async autoTranslate(response: string | Array<any> | Record<string, any>, locale: string) {
		const isObject = typeof response === 'object';
		const value = isObject ? JSON.stringify(response) : response;

		// Get the matches, if none, return the query.
		const matches = this.getTranslateMatches(value);
		if (matches.length === 0) return isObject ? JSON.parse(value) : value;

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
		const translatedItems = await this.batchTranslate(locale, itemsToTranslate);

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
