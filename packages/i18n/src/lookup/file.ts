import type { IConfig, ILookup, IQuery, ITranslation } from '../types';
import { Logger } from '@sodacore/core';
import Lookup from '../decorator/lookup';
import { Inject } from '@sodacore/di';
import { resolve } from 'node:path';
import process from 'node:process';
import { Glob } from 'bun';

@Lookup()
export default class FileLookup implements ILookup {
	@Inject('@i18n:config') protected config!: IConfig;
	@Inject() protected logger!: Logger;
	protected translationsPath: string = '';
	protected translations: Record<string, ITranslation> = {};

	public async onInit() {

		// Set the translations path based on the config or default to './translations'.
		this.translationsPath = this.config?.fileTranslationsPath
			? this.config.fileTranslationsPath.startsWith('./')
				? resolve(process.cwd(), this.config.fileTranslationsPath)
				: this.config.fileTranslationsPath
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

	public async supports(locale: string): Promise<boolean> {
		const availableLanguages = await this.getAvailableLanguages();
		return availableLanguages.includes(locale);
	}

	public async getAvailableLanguages(): Promise<string[]> {
		const availableLanguages = [];
		if (this.config.defaultLocale) availableLanguages.push(this.config.defaultLocale);
		return availableLanguages.concat(Object.keys(this.translations));
	}

	public async onTranslate(query: string, languageCode: string, fallback?: string): Promise<string> {
		if (!this.translations[languageCode]) return fallback ?? query;
		return this.translations[languageCode][query] || (fallback ?? query);
	}

	public async onTranslateMultiple(queries: IQuery[], languageCode: string): Promise<IQuery[]> {
		const translated: IQuery[] = JSON.parse(JSON.stringify(queries));
		return await Promise.all(translated.map(async query => ({
			...query,
			translated: await this.onTranslate(query.value, languageCode, query.value ?? query.original),
		})));
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
