import { Registry } from '@sodacore/registry';
import type { IConfig, IParsedLanguage } from '../types';

export function parseLocaleHeader(acceptedLanguages: string) {
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

export function scoreLocaleMatch(requested: IParsedLanguage, supported: string) {
	const [supportedLang, supportedRegion] = supported.split('-');
	const languageMatches = requested.language === supportedLang.toLowerCase();
	const regionMatches = requested.region === supportedRegion?.toUpperCase();

	if (languageMatches && regionMatches) return 100;
	if (languageMatches && requested.region) return 80; // specific region requested, different matched
	if (languageMatches && !requested.region) return 60; // language-only match

	return 0;
}

export function getBestLocale(acceptLanguageHeader: string, availableLanguages: string[]) {
	const parsedLanguages = parseLocaleHeader(acceptLanguageHeader);
	let bestMatch: { locale: string, score: number } | null = null;
	const config = Registry.get<IConfig>('@i18n:config');

	for (const requested of parsedLanguages) {
		for (const supported of availableLanguages) {
			const score = scoreLocaleMatch(requested, supported) * requested.quality;

			if (!bestMatch || score > bestMatch.score) {
				bestMatch = { locale: supported, score };
			}
		}
	}

	return bestMatch?.locale || config?.defaultLocale || 'en-GB';
}
