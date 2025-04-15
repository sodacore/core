import type PrismaClient from './export/prisma';

export type IConfig = {
	onInit?: (prisma: PrismaClient) => void | Promise<void>,
};
