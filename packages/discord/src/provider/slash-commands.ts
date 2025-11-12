import type { IConfig, IDiscordOptionsCommand, IDiscordOptionsGroup, IDiscordOptionsSubCommand, IRouterControllerMethodItem } from '../types';
import { Inject, Provide, Utils } from '@sodacore/di';
import { Registry } from '@sodacore/registry';
import { Client, ContextMenuCommandBuilder, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { toBuilder } from '../helper/slash-commands';

@Provide()
export default class SlashCommandsProvider {
	@Inject('@discord:config') private config!: IConfig;
	@Inject('discord') private discord!: Client;

	public async registerGlobal() {

		// Validate the config.
		if (!this.config.token || !this.config.clientId) {
			throw new Error('You need a valid bot token and client ID to use slash commands.');
		}

		// Get the commands.
		const commands = this.getCommands();

		// Create a rest instance.
		const rest = new REST().setToken(this.config.token);

		// Register the commands to the guild ID.
		const data: any = await rest.put(
			Routes.applicationCommands(this.config.clientId),
			{ body: commands },
		);

		// Notify console.
		return data.length;
	}

	public async registerGuild(guildId?: string) {

		// Validate the config.
		if (!this.config.token || !this.config.clientId) {
			throw new Error('You need a valid bot token and client ID to use slash commands.');
		}

		// Get the guild ID.
		const theGuildId = guildId || this.config.guildId;
		if (!theGuildId) {
			throw new Error('You need a valid guild ID to register slash commands with a guild.');
		}

		// Get the commands.
		const commands = this.getCommands();

		// Create a rest instance.
		const rest = new REST().setToken(this.config.token);

		// Register the commands to the guild ID.
		const data: any = await rest.put(
			Routes.applicationGuildCommands(this.config.clientId, theGuildId),
			{ body: commands },
		);

		// Notify console.
		return data.length;
	}

	public async unregisterGlobal() {

		// Validate the config.
		if (!this.config.token || !this.config.clientId) {
			throw new Error('You need a valid bot token and client ID to use slash commands.');
		}

		// Create a rest instance.
		const rest = new REST().setToken(this.config.token);

		// Collect the commands.
		const commands = await this.discord.application?.commands.fetch();
		if (!commands) return false;

		// Collect the command IDs.
		const commandIds = commands.map(command => command.id);
		if (!commandIds.length) return false;

		// Unregister the commands.
		try {
			for (const commandId of commandIds) {
				await rest.delete(Routes.applicationCommand(this.config.clientId, commandId));
			}
			return true;
		} catch {
			return false;
		}
	}

	public async unregisterGuild(guildId?: string) {

		// Validate the config.
		if (!this.config.token || !this.config.clientId) {
			throw new Error('You need a valid bot token and client ID to use slash commands.');
		}

		// Define the guild ID.
		const theGuildId = typeof guildId === 'string' ? guildId : this.config.guildId;
		if (!theGuildId) {
			throw new Error('You need a valid guild ID to unregister slash commands.');
		}

		// Get the guild.
		const guild = this.discord.guilds.cache.get(theGuildId);
		if (!guild) {
			throw new Error(`Guild with ID ${theGuildId} not found.`);
		}

		// Create a rest instance.
		const rest = new REST().setToken(this.config.token);

		// Collect the commands.
		const commands = await guild.commands.fetch();
		if (!commands) return false;

		// Collect the command IDs.
		const commandIds = commands.map(command => command.id);
		if (!commandIds.length) return false;

		// Unregister the commands.
		try {
			for (const commandId of commandIds) {
				await rest.delete(Routes.applicationGuildCommand(this.config.clientId, theGuildId, commandId));
			}
			return true;
		} catch {
			return false;
		}
	}

	private getCommands() {

		// Define the controllers.
		const controllers: any[] = [];

		// Get all discord controllers.
		const modules = Registry.all();
		for (const module of modules) {
			const types = Utils.getMeta<string[]>('type', 'autowire')(module.constructor, undefined, []);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);
			if (types.length === 0 || !services.includes('discord')) continue;
			controllers.push(module);
		}

		// Now let's get all the slash commands.
		const commands = controllers.map(controller => {
			const builder: SlashCommandBuilder = Utils.getMeta('builder', 'discord')(controller.constructor);
			if (builder) {
				return builder.toJSON();
			} else {

				const builderOptions: IDiscordOptionsCommand = Utils.getMeta('options', 'discord')(controller.constructor, undefined, {});
				if (!builderOptions || !builderOptions.name) return null;

				const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(controller, undefined, [])
					.map(method => {
						const subCommand = Utils.getMeta<IDiscordOptionsSubCommand | null>('subcommand', 'discord')(controller, method.key, null);
						if (!subCommand) return null;
						return {
							...method,
							subCommand,
							options: Utils.getMeta<IDiscordOptionsGroup[]>('options', 'discord')(controller, method.key, []).reverse(),
						};
					})
					.filter(Boolean) as IRouterControllerMethodItem[];

				return toBuilder(builderOptions, methods).toJSON();
			};
		}).filter(Boolean);

		// Now get the context menu commands.
		const contextMenuCommands = controllers.map(controller => {

			// Check if it's a context menu type.
			const type = Utils.getMeta<string>('type', 'discord')(controller.constructor);
			if (type !== 'contextmenu') return [];

			// Now get the methods.
			const methods = Utils.getMeta<IRouterControllerMethodItem[]>('methods', 'discord')(controller, undefined, []);
			return methods.map(method => {
				const builder: ContextMenuCommandBuilder = Utils.getMeta('builder', 'discord')(controller, method.key);
				if (!builder) return null;
				return builder.toJSON();
			});
		}).filter(Boolean).flat();

		// Return the slash and context commands.
		return [...commands, ...contextMenuCommands];
	}
}
