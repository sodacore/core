import type { IConfig, IQuery, ITranslation } from '../types';
import { BaseService, Service } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import { Glob } from 'bun';
import { resolve } from 'node:path';
import process from 'node:process';

@Service()
export default class I18nService extends BaseService {
	@Inject('@i18n:config') private config?: IConfig;
	private translationsPath!: string;
	private _hasTranslations = false;
	private translations: Record<string, ITranslation> = {};

	public async init() {
		this.logger.info('[I18N]: Initialising the i18n service.');

		// Set the translations path based on the config or default to './translations'.
		this.translationsPath = this.config?.translationsPath
			? this.config.translationsPath.startsWith('./')
				? resolve(process.cwd(), this.config.translationsPath)
				: this.config.translationsPath
			: resolve(process.cwd(), './translations');

		// Get the file paths.
		const tFilePaths = await this.getFilePaths();
		if (!tFilePaths || tFilePaths.length === 0) {
			this.logger.error('[I18N]: No translation files found or unable to access the translations directory.');
			return;
		}

		// Let's load the contents of the translation files.
		this.translations = await this.loadTranslations(tFilePaths);

		// Log the found translation files.
		this.logger.info(`[I18N]: Found ${tFilePaths.length} translation file(s).`);
	}

	public hasTranslations() {
		return this._hasTranslations;
	}

	public translate(query: string, languageCode: string, fallback?: string) {
		if (!this._hasTranslations) throw new Error('[I18N]: No translations available.');
		if (this.translations[languageCode]) {
			return this.translations[languageCode][query] || (fallback ?? query);
		}
		return (fallback ?? query);
	}

	public translateMultiple(queries: IQuery[], languageCode: string) {
		if (!this._hasTranslations) {
			return queries.map(query => ({
				...query,
				translated: query.value ?? query.original,
			}));
		}

		return queries.map(query => {
			const translated = this.translate(query.value, languageCode, query.value ?? query.original);
			return {
				...query,
				translated,
			};
		});
	}

	public getAvailableLanguages(lower?: boolean) {
		if (!this._hasTranslations) return [];
		const defaultLang = this.config?.defaultLocale || 'en-GB';
		const availableLanguages = lower ? Object.keys(this.translations) : Object.keys(this.translations);
		return [defaultLang, ...availableLanguages];
	}

	private async getFilePaths() {
		const files: string[] = [];
		const glob = new Glob(`*.json`);

		try {
			for await (const file of glob.scan({
				cwd: this.translationsPath,
				onlyFiles: true,
				absolute: true,
			})) {
				files.push(file);
				this._hasTranslations = true;
			}

			return files;
		} catch {
			return null;
		}
	}

	private async loadTranslations(filePaths: string[]) {
		const translations: Record<string, ITranslation> = {};

		for (const filePath of filePaths) {
			try {
				const content = await Bun.file(filePath).json();
				const fileName = filePath.split('/').pop()?.replace('.json', '');
				if (!fileName) throw new Error(`Invalid file name: ${filePath}`);
				const [lang, country] = fileName.split('-') || [];
				translations[fileName] = {
					_lang: lang ?? 'en',
					_code: fileName,
					_country: country ?? 'gb',
					...content,
				};
			} catch (error) {
				this.logger.error(`[I18N]: Error loading translation file "${filePath}": ${error}`);
			}
		}

		return translations;
	}
}
