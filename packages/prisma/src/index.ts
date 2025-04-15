import 'reflect-metadata';
import PrismaService from './service/prisma';
import PrismaPlugin from './module/plugin';
import PrismaClient from './export/prisma';

export default PrismaPlugin;

export {
	PrismaClient,
	PrismaService,
};
