import 'reflect-metadata';
import I18nPlugin from './module/plugin';
import I18nService from './service/i18n';
import I18nProvider from './provider/i18n';
import TranslateTransform from './transform/translate';
import * as I18nHelper from './helper/constants';
import type { IConfig, ITranslation } from './types';

export default I18nPlugin;

export {
	I18nHelper,
	I18nProvider,
	I18nService,
	TranslateTransform,
};

export type {
	IConfig,
	ITranslation,
};
