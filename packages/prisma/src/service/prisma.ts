import { BaseService, Service } from '@sodacore/core';
import { Registry } from '@sodacore/registry';
import PrismaClient from '../export/prisma';
import { Inject } from '@sodacore/di';
import type { IConfig } from '../types';

@Service()
export default class PrismaService extends BaseService {
	@Inject('@prisma:config') private config?: IConfig;
	private prisma?: PrismaClient;

	public async init() {
		this.logger.info('[PRISMA]: Initialising the prisma client.');
		this.prisma = new PrismaClient();
		if (this.config && this.config.onInit) {
			await this.config.onInit(this.prisma);
		}
		Registry.set(PrismaClient.name, this.prisma);
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
}
