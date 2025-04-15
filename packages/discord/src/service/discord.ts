import type { IConfig } from '../types';
import { BaseService, Service } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import { CacheType, Client, ClientEventTypes, ClientOptions, Interaction } from 'discord.js';
import Router from './router';
import { Registry } from '@sodacore/registry';

/**
 * The Discord service, will initialise a discord client
 * that can then route interactions and messages to the
 * appropriate handlers.
 * @class DiscordService
 * @extends {BaseService}
 * @default
 */
@Service()
export default class DiscordService extends BaseService {
	@Inject('@discord:config') private config!: IConfig;
	private router = new Router(this.logger);
	private client!: Client;
	private discordConfig: ClientOptions = {
		intents: [],
	};

	public async init() {
		if (!this.config.token) return;
		await this.router.init();

		// Let's setup the discord client.
		this.client = new Client(Object.assign(this.discordConfig, this.config.clientOptions));
		this.client.on('ready', () => {
			this.logger.info('[DISCORD]: Successfully connected and ready.');
		});

		// Register with the DI container.
		Registry.set('discord', this.client);

		// Handle the interaction create.
		this.client.on('interactionCreate', this.handleInteraction.bind(this));

		// Loop the other events.
		const events = this.config.events || [];
		events.forEach(event => {
			this.client.on(event, (...args: unknown[]) => {
				this.handleEvent(event, ...args);
			});
		});
	}

	public async start() {
		if (!this.config.token) return;
		this.logger.info('[DISCORD]: Connecting to Discord...');
		this.client.login(this.config.token);
	}

	public async stop() {
		if (!this.config.token) return;
		if (!this.client) return;
		this.logger.info('[DISCORD]: Disconnected from Discord.');
		this.client.destroy();
	}

	private handleInteraction(interaction: Interaction<CacheType>) {

		// On command interaction.
		if (interaction.isChatInputCommand()) {

			// Check if we have a subcommand.
			const subCommand = interaction.options.getSubcommand(false);

			// If no subcommand, run the default.
			if (!subCommand) {
				return this.router.onCommand(interaction);
			} else {
				return this.router.onSubCommand(interaction);
			}
		}

		// On button interaction.
		if (interaction.isButton()) {
			return this.router.onButton(interaction);
		}

		// On select menu interaction.
		if (interaction.isStringSelectMenu()) {
			return this.router.onSelectMenu(interaction);
		}

		// On autocomplete interaction.
		if (interaction.isAutocomplete()) {
			return this.router.onAutocomplete(interaction);
		}

		// On context menu interaction.
		if (interaction.isContextMenuCommand()) {
			return this.router.onContextMenu(interaction);
		}

		// On modal interaction.
		if (interaction.isModalSubmit()) {
			return this.router.onModalSubmit(interaction);
		}
	}

	private handleEvent(event: keyof ClientEventTypes, ...args: unknown[]) {
		return this.router.onEvent(event, ...args);
	}
}
