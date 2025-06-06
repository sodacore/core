import type { IConfig } from '../types';
import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import { file } from 'bun';
import I18nService from '../service/i18n';
import I18nProvider from '../provider/i18n';

const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

export default class I18nPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;

	public constructor(protected config: IConfig = {}) {
		super(config);
		this.setup();
	}

	public async install(app: Application) {
		app.register(I18nProvider);
		app.register(I18nService);
	}
}
