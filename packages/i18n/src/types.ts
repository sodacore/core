export type IConfig = {
	defaultLocale?: string,
	enableFileLookup?: boolean,
	fileTranslationsPath?: string,
	overrideGetParam?: string,
};

export type ITranslation = {
	_lang: string,
	_code: string,
	_country: string,
	[key: string]: string,
};

export type IParsedLanguage = {
	locale: string, // e.g. 'en-GB'
	quality: number, // q value
	language: string, // e.g. 'en'
	region?: string, // e.g. 'GB'
};

export type IQuery = {
	original: string,
	value: string,
	translated?: string,
};

export interface ILookup {
	supports(locale: string): Promise<boolean>,
	getAvailableLanguages(): Promise<string[]>,
	onTranslate(query: string, languageCode: string, fallback?: string): Promise<string>,
	onTranslateMultiple(queries: IQuery[], languageCode: string): Promise<IQuery[]>,
};
