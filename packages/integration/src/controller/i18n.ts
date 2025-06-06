import { Inject } from '@sodacore/di';
import { Controller, Get, Headers, Transform } from '@sodacore/http';
import { I18nProvider, TranslateTransform } from '@sodacore/i18n';

@Controller('/i18n')
@Transform(TranslateTransform)
export default class I18nController {
	@Inject() private i18n!: I18nProvider;

	@Get('/manual')
	public async manual(@Headers('accept-language') acceptedLanguage: string) {
		const languageCode = this.i18n.getAvailableTranslation(acceptedLanguage);
		const messages = ['Hello, World', 'How are you?'];
		return messages.map(message => this.i18n.translate(message, languageCode ?? 'en-GB'));
	}

	@Get('/automatic')
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
}
