export type IConfig = {
	defaultLang?: string,
	translationsPath?: string,
};

export type ITranslation = {
	_lang: string,
	_code: string,
	_country: string,
	[key: string]: string,
};
