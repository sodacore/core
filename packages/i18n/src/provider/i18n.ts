import type { IConfig } from '../types';
import { Inject, Provide } from '@sodacore/di';
import I18nService from '../service/i18n';

@Provide()
export default class I18nProvider {
	@Inject('@i18n:config') private config?: IConfig;
	@Inject() private i18nService!: I18nService;
	private defaultLanguage = this.config?.defaultLang || null;

	public t(query: string, languageCode: string) {
		if (!this.i18nService.hasTranslations()) return query;
		return this.i18nService.translate(query, languageCode);
	}

	public translate(query: string, languageCode: string, fallback?: string) {
		if (!this.i18nService.hasTranslations()) return fallback ?? query;
		return this.i18nService.translate(query, languageCode ?? this.config?.defaultLang, fallback);
	}

	public getAvailableTranslation(acceptedLanguages: string) {

		// If no translations, then return the default language.
		if (!this.i18nService.hasTranslations()) return null;

		// Collect the accepted languages.
		const languages = acceptedLanguages.split(',').map(item => {
			const [lang, priority] = item.split(';');
			if (priority && priority.startsWith('q=')) {
				return { code: lang.trim(), priority: parseFloat(priority.split('=')[1]) };
			}
			return { code: lang.trim(), priority: 1.0 }; // Default priority if not specified.
		});

		// Get the available languages.
		const availableLanguages = this.i18nService.getAvailableLanguages(true);
		if (availableLanguages.length === 0) return null;

		// Find the best match based on priority.
		const bestMatch = languages.reduce((best, current) => {
			const langCode = current.code.toLowerCase();
			const hasLanguage = availableLanguages.includes(langCode);
			if (this.defaultLanguage) {
				if (!hasLanguage && langCode === this.defaultLanguage.toLowerCase()) {
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
			? bestMatch.code.toLowerCase() === this.defaultLanguage.toLowerCase()
				? null
				: bestMatch.code.toLowerCase()
			: bestMatch.code.toLowerCase();
	}
}
