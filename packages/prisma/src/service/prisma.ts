import type { IConfig, IPrismaClient } from '../types';
import { BaseService, Service } from '@sodacore/core';
import { Registry } from '@sodacore/registry';
import { Inject } from '@sodacore/di';
import { resolve } from 'node:path';
import { createPrismaSchemaBuilder } from '@mrleebo/prisma-ast';
import process from 'node:process';
import { file } from 'bun';

@Service()
export default class PrismaService extends BaseService {
	@Inject('@prisma:config') private config?: IConfig;
	private prismaFolderPath = resolve(process.cwd(), './prisma');
	private importPath: string | null = null;
	private prisma?: IPrismaClient;

	public async init() {
		this.logger.info('[PRISMA]: Initialising the prisma client.');

		// Load the schema file.
		const schemaFile = await this.getSchemaFile();
		const schemaFileContents = await schemaFile.text();
		const schemaAst = createPrismaSchemaBuilder(schemaFileContents);

		// Look for the datasource block.
		const datasourceBlock = schemaAst.findByType('generator', { name: 'client' });
		if (!datasourceBlock) {
			this.importPath = '@prisma/client';
		} else {
			const output = datasourceBlock.assignments.find(item => item.type === 'assignment' && item.key === 'output');
			if (!output || output.type !== 'assignment' || !output.value) {
				this.importPath = '@prisma/client';
			} else {
				this.importPath = resolve(this.prismaFolderPath, String(output.value).replaceAll('\"', ''));
			}
		}

		// Import the prisma module dynamically.
		const prismaModule = await import(this.importPath);
		if (!prismaModule || !prismaModule.PrismaClient) {
			throw new Error(`Prisma client not found at: ${this.importPath}`);
		}

		// Get the prisma client class, and attach some metadata, and prepare for injection.
		prismaModule.PrismaClient._TEST = 'hello';
		this.prisma = new prismaModule.PrismaClient();
		Registry.set('PrismaClient', this.prisma);
		Registry.set('prisma', this.prisma);

		// If there is an onInit function in the config, call it.
		if (this.config && this.config.onInit) {
			await this.config.onInit(this.prisma as any);
		}
	}

	public async start() {
		if (!this.prisma) throw new Error('Prisma client not initialised.');
		this.logger.info('[PRISMA]: Starting the prisma client.');
		await this.prisma?.$connect();
	}

	public async stop() {
		if (!this.prisma) throw new Error('Prisma client not initialised.');
		this.logger.info('[PRISMA]: Stopping the prisma client.');
		await this.prisma?.$disconnect();
	}

	private async getSchemaFile() {
		const defaultSchemaFilePath = resolve(this.prismaFolderPath, './schema.prisma');
		const schemaFilePath = this.config?.schemaFileLocation ?? defaultSchemaFilePath;
		const schemaHandle = file(schemaFilePath);
		if (await schemaHandle.exists()) {
			return schemaHandle;
		}
		throw new Error(`Prisma schema file not found at: ${schemaFilePath}`);
	}
}
