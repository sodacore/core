import 'reflect-metadata';
import I18nPlugin from './module/plugin';
import I18nService from './service/i18n';
import I18nProvider from './provider/i18n';
import TranslateTransform from './transform/translate';
import * as helper from './helper/constants';

export default I18nPlugin;

export {
	helper,
	I18nProvider,
	I18nService,
	TranslateTransform,
};
