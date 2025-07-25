import { Inject } from '@sodacore/di';
import { Controller, Get, Headers, Query, Transform } from '@sodacore/http';
import { I18nProvider, TranslateTransform } from '@sodacore/i18n';

@Controller('/i18n')
export default class I18nController {
	@Inject() private i18n!: I18nProvider;

	@Get('/manual/')
	public async manual(
		@Headers('accept-language') acceptedLanguage: string,
		@Query('locale') locale?: string,
	) {
		const languageCode = this.i18n.getBestLocale(acceptedLanguage);
		const messages = ['Hello, World', 'How are you?'];
		return messages.map(message => this.i18n.translate(message, locale ?? languageCode ?? 'en-GB'));
	}

	@Get('/automatic')
	@Transform(TranslateTransform)
	public async automatic() {
		return [
			'_t(Hello, World)',
			{
				h: '_t(How are you?)',
				d: {
					b: '_t(Hello, World)',
					c: [
						'_t(How are you?)',
						'_t(Hello, World)',
					],
				},
			},
		];
	}

	@Get('/automan')
	public async automan(
		@Headers('accept-language') acceptedLanguage: string,
		@Query('locale') userLocale?: string,
	) {
		const locale = userLocale || this.i18n.getBestLocale(acceptedLanguage) || 'en-GB';

		const dString = '_t(Hello, World), _t(How are you?)';
		const dArray = ['_t(How are you?)', '_t(Hello, World)', { foo: '_t(Hello, World)' }];
		const dObject = { foo: '_t(Hello, World)', bar: '_t(How are you?)', baz: ['_t(Hello, World)', '_t(How are you?)'] };

		console.log('String', this.i18n.autoTranslate(dString, locale));
		console.log('Array', this.i18n.autoTranslate(dArray, locale));
		console.log('Object', this.i18n.autoTranslate(dObject, locale));

		return 'Hi';
	}
}
