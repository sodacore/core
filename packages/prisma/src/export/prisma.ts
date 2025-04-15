import { PrismaClient } from '@prisma/client';
import { Utils } from '@sodacore/di';

Utils.setMeta('type', 'autowire')(PrismaClient, 'thirdParty');

export default PrismaClient;
