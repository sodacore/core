import type { IConfig } from '../types';
import { type Application, BasePlugin, type IPlugin, Utils } from '@sodacore/core';
import { file } from 'bun';
import DiscordService from '../service/discord';
import SlashCommandsProvider from '../provider/slash-commands';
import OAuthProvider from '../provider/oauth';
import DiscordScripts from '../script/general';

const packageJson = file(Utils.resolve(import.meta.dirname, '../../package.json'));
if (!await packageJson.exists()) throw new Error('Package.json not found.');
const packageMeta = await packageJson.json();

export default class DiscordPlugin extends BasePlugin implements IPlugin {
	public name = packageMeta.name;
	public version = packageMeta.version;
	public description = packageMeta.description;
	public author = packageMeta.author;

	public constructor(protected config: IConfig = {}) {
		super(config);
		this.setup();
	}

	public async install(app: Application) {
		app.register(DiscordScripts);
		app.register(DiscordService);
		app.register(OAuthProvider);
		app.register(SlashCommandsProvider);
	}
}
