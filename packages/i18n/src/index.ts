import 'reflect-metadata';
import type { IConfig, ILookup, IParsedLanguage, IQuery, ITranslation } from './types';
import Lookup from './decorator/lookup';
import I18nPlugin from './module/plugin';
import I18nService from './service/i18n';
import I18nProvider from './provider/i18n';
import TranslateTransform from './transform/translate';
import * as Constants from './helper/constants';
import * as Utils from './helper/utils';

export default I18nPlugin;

export {
	Constants,
	I18nProvider,
	I18nService,
	Lookup,
	TranslateTransform,
	Utils,
};

export type {
	IConfig,
	ILookup,
	IParsedLanguage,
	IQuery,
	ITranslation,
};
