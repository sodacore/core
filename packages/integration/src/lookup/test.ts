// import { type ILookup, type IQuery, Lookup } from '@sodacore/i18n';

// @Lookup()
// export default class TestLookup implements ILookup {

// 	public async supports(locale: string) {
// 		console.log(`Checking support for locale: ${locale}`);
// 		return true;
// 	}

// 	public async getAvailableLanguages(): Promise<string[]> {
// 		return ['en-GB'];
// 	}

// 	public async onTranslate(query: string, languageCode: string, fallback?: string) {
// 		console.log(`Translating query: ${query} for language: ${languageCode} with fallback: ${fallback}`);
// 		return `Translated: ${query}`;
// 	}

// 	public async onTranslateMultiple(queries: IQuery[], languageCode: string) {
// 		console.log(`Translating multiple queries for language: ${languageCode}`);
// 		return queries.map(query => ({
// 			...query,
// 			translated: `Translated: ${query.value}`,
// 		}));
// 	}
// }
