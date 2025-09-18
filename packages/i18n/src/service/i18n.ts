import type { ILookup, ITranslation } from '../types';
import { BaseService, Service } from '@sodacore/core';
import { Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';

@Service()
export default class I18nService extends BaseService {
	// @Inject('@i18n:config') private config?: IConfig;
	// private translationsPath!: string;
	private _hasTranslations = false;
	private translations: Record<string, ITranslation> = {};
	private lookups: ILookup[] = [];

	public async init() {
		this.logger.info('[I18N]: Initialising the i18n service.');

		// Now load any lookups that are registered.
		const modules = Registry.all();
		for (const module of modules) {
			const type = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			if (!type || !Array.isArray(type)) continue;
			if (type.includes('lookup')) {
				this.lookups.push(module as ILookup);
			}
		}

		this.logger.info(`[I18N]: Found ${this.lookups.length} lookup(s).`);
	}

	public hasTranslations() {
		return this._hasTranslations;
	}

	public getTranslations() {
		return this.translations;
	}

	public getLookups() {
		return this.lookups;
	}
}
