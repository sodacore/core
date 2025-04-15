import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import PrismaService from '../service/prisma';
import { file } from 'bun';
import type { IConfig } from '../types';

const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

export default class PrismaPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;

	public constructor(protected config: IConfig = {}) {
		super(config);
		this.setup();
	}

	public async install(app: Application) {
		app.register(PrismaService);
	}
}
