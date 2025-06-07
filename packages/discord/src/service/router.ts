import type { IAuthFunctionItem, IControllerMethodArgItem, IRouterControllerItem, IRouterControllerMethodItem } from '../types';
import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Client, ClientEventTypes, ContextMenuCommandInteraction, GuildMember, Interaction, ModalSubmitInteraction, SharedSlashCommand, StringSelectMenuInteraction, User } from 'discord.js';
import { Registry } from '@sodacore/registry';
import { Utils } from '@sodacore/di';
import { Logger } from '@sodacore/core';

export default class Router {
	private controllers: IRouterControllerItem[] = [];

	public constructor(
		private logger: Logger,
	) {}

	public async init() {

		// Collect the controllers.
		const modules = Registry.all();
		for (const module of modules) {

			// Validate the type and service.
			const type = Utils.getMeta('type', 'autowire')(module.constructor);
			const services = Utils.getMeta<string[]>('services', 'controller')(module.constructor, undefined, []);
			if (type !== 'controller' || !services.includes('discord')) continue;

			// Collect the commands.
			const builder: SharedSlashCommand | null = Utils.getMeta('builder', 'discord')(module.constructor);
			const methods: IRouterControllerMethodItem[] = Utils.getMeta('methods', 'discord')(module, undefined, []);
			this.controllers.push({
				className: module.constructor.name,
				name: builder?.name ?? null,
				methods,
				module,
			});
		}
	}

	public async onCommand(interaction: ChatInputCommandInteraction) {

		// Get the controller.
		const command = interaction.commandName;
		const controller = this.getController(command);
		if (!controller) return this.sendResponse(interaction, `No available controller found for: ${command}.`);

		// Now get the method.
		const method = this.getControllerMethod(controller, false);
		if (!method) return this.sendResponse(interaction, `No available handler for: ${command}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'command', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing the command ${command}, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onSubCommand(interaction: ChatInputCommandInteraction) {

		// Get the controller.
		const command = interaction.commandName;
		const subCommand = interaction.options.getSubcommand(false);
		const controller = this.getController(command);
		if (!controller || !subCommand) return this.sendResponse(interaction, `No available controller found for: ${command}.`);

		// Now get the method.
		const method = this.getControllerMethod(controller, subCommand);
		if (!method) return this.sendResponse(interaction, `No available handler for: ${subCommand}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'subcommand', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing the command ${command}, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onButton(interaction: ButtonInteraction) {

		// Get the unique ID and validate it's not internal.
		const uniqueId = interaction.customId;
		if (uniqueId.startsWith('internal:')) return;

		// Get the controller.
		const { controller, method } = this.getControllerbyUnique('button', uniqueId);
		if (!controller || !method) return this.sendResponse(interaction, `No available controller found for: ${uniqueId}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'button', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing that action, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onSelectMenu(interaction: StringSelectMenuInteraction) {

		// Get the unique ID and validate it's not internal.
		const uniqueId = interaction.customId;
		if (uniqueId.startsWith('internal:')) return;

		// Get the controller.
		const { controller, method } = this.getControllerbyUnique('selectmenu', uniqueId);
		if (!controller || !method) return this.sendResponse(interaction, `No available controller found for: ${uniqueId}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'selectmenu', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing that action, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onContextMenu(interaction: ContextMenuCommandInteraction) {

		// Get the unique ID and validate it's not internal.
		const uniqueId = interaction.commandName;
		if (uniqueId.startsWith('internal:')) return;

		// Get the controller.
		const { controller, method } = this.getControllerbyUnique('contextmenu', uniqueId);
		if (!controller || !method) return this.sendResponse(interaction, `No available controller found for: ${uniqueId}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'contextmenu', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing that action, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onAutocomplete(interaction: AutocompleteInteraction) {

		// Define the params.
		const commandName = interaction.commandName;
		const subCommand = interaction.options.getSubcommand(false);
		const { value, name } = interaction.options.getFocused();

		// Let's get the controller.
		const controller = this.getController(commandName);
		if (!controller) return interaction.respond([]);

		// Let's get the method.
		const method = this.getControllerMethodByMultiple(controller, 'autocomplete', name, subCommand ?? undefined);
		if (!method) return interaction.respond([]);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return interaction.respond([]);

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'autocomplete', methodArguments, value);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			if (interaction.responded) return;
			if (['boolean', 'null', 'undefined'].includes(typeof result)) return await interaction.respond([]);
			if (['string', 'number'].includes(typeof result)) return await interaction.respond([{ name: String(result), value: result }]);
			if (Array.isArray(result)) return await interaction.respond(result);
			if (typeof result === 'object') return await interaction.respond([result]);
			return await interaction.respond([]);
		} catch (err) {
			this.logger.error(`There was an error executing that action, with error: ${(err as Error).message}.`);
			return await interaction.respond([]);
		}
	}

	public async onModalSubmit(interaction: ModalSubmitInteraction) {

		// Get the unique ID and validate it's not internal.
		const uniqueId = interaction.customId;
		if (uniqueId.startsWith('internal:')) return;

		// Get the controller.
		const { controller, method } = this.getControllerbyUnique('modalsubmit', uniqueId);
		if (!controller || !method) return this.sendResponse(interaction, `No available controller found for: ${uniqueId}.`);

		// Validate the authentication guards.
		const status = await this.verifyAuthentication(interaction.client, method.auth, interaction.user, interaction.guildId);
		if (!status) return this.sendResponse(interaction, 'You are not authorized to use this command.');

		// Define the function arguments.
		const methodArguments = Utils.getMeta<IControllerMethodArgItem[]>('args', 'discord')(controller.module, method.key, []);
		const functionArguments = this.getMethodArguments(interaction, controller.module, method.key, 'modalsubmit', methodArguments);

		// Execute the method and catch any issues.
		try {
			const result = await controller.module[method.key].bind(controller.module)(...functionArguments);
			return this.sendResponse(interaction, result);
		} catch (err) {
			this.logger.error(`There was an error executing that action, with error: ${(err as Error).message}.`);
			return this.sendResponse(interaction, false);
		}
	}

	public async onEvent(event: keyof ClientEventTypes, ...data: unknown[]) {
		try {
			for (const controller of this.controllers) {
				for (const method of controller.methods) {

					// Does the method match.
					if (method.type !== 'event' || method.unique !== event) continue;

					// Execute the method.
					await controller.module[method.key].bind(controller.module)(...data);
				}
			}
		} catch (err) {
			this.logger.error(`There was an error executing the event ${event}, with error: ${(err as Error).message}.`);
		}
	}

	private getMethodArguments(
		interaction: Interaction | ContextMenuCommandInteraction,
		handler: any,
		methodName: string,
		type: string,
		args: IControllerMethodArgItem[],
		query?: string,
	) {

		// Get the param count.
		const paramTypes = Reflect.getMetadata('design:paramtypes', handler, methodName);
		const paramCount = paramTypes.length;
		const params: any[] = [];

		// Create some params, and then loop and apply.
		for (let i = 0; i < paramCount; i++) {

			// Check for args.
			const arg = args.find(arg => arg.index === i);
			if (!arg) {
				params.push(null);
				continue;
			}

			// Validate the argument.
			if (arg.type === 'query' && type !== 'autocomplete') throw new Error('Query arguments are only available for autocomplete methods.');
			if (arg.type === 'field' && type !== 'modalsubmit') throw new Error('Field arguments are only available for modal submit methods.');

			// Get the params data.
			if (arg.type === 'interaction') params.push(interaction);
			if (arg.type === 'user') params.push(interaction.user);
			if (arg.type === 'channel') params.push(interaction.channel);
			if (arg.type === 'guild') params.push(interaction.guild);
			if (arg.type === 'client') params.push(interaction.client);
			if (arg.type === 'query') params.push(query ?? null);
			if (arg.type === 'option') {
				if (interaction.isChatInputCommand() && arg.name) {
					const value = interaction.options.get(arg.name);
					if (!value) {
						params.push(null);
						continue;
					}

					params.push(arg.format ? value : value.value);
					continue;
				} else {
					params.push(null);
					continue;
				}
			}
			if (arg.type === 'field' && arg.name) {
				if (interaction.isModalSubmit()) {
					const value = interaction.fields.getTextInputValue(arg.name);
					params.push(value);
					continue;
				} else {
					params.push(null);
					continue;
				}
			}
		}

		return params;
	}

	private getController(command: string) {
		return this.controllers.find((item: any) => item.name === command);
	}

	private getControllerMethod(controller: IRouterControllerItem, unique: string | boolean, type?: string) {
		const methodType: string = type ?? typeof unique === 'string' ? 'subcommand' : 'command';
		return controller.methods.find((item: IRouterControllerMethodItem) => {
			return item.unique === unique && item.type === methodType;
		});
	}

	private getControllerMethodByMultiple(controller: IRouterControllerItem, type: string, unique: string, subType?: string) {
		return controller.methods.find((item: IRouterControllerMethodItem) => {
			return item.unique === unique && item.type === type && (subType && item.subType === subType);
		});
	}

	private getControllerbyUnique(type: string, uniqueId: string) {

		// Should return a controller and method.
		let controller: IRouterControllerItem | null = null;
		let method: IRouterControllerMethodItem | null = null;

		// Loop through the controllers.
		for (const item of this.controllers) {
			const found = item.methods.find((method: IRouterControllerMethodItem) => {
				return method.unique === uniqueId && method.type === type;
			});

			if (found) {
				controller = item;
				method = found;
				break;
			}
		}

		return { controller, method };
	}

	private sendResponse(
		interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction,
		result: unknown,
	) {

		// Define the methodName.
		const replyCallback = this.getReplyMethod(interaction, String(result));

		// Is null.
		if (result === null || result === undefined) {
			if (interaction.replied) return;
			return replyCallback({
				content: 'That action was executed.',
				embeds: [],
				components: [],
			});
		}

		// Is boolean.
		if (typeof result === 'boolean') {
			return replyCallback({
				content: result ? '✅ That action was successful.' : '❌ Failed to complete that action.',
				embeds: [],
				components: [],
			});
		}

		// Is primitive.
		if (['string', 'number'].includes(typeof result)) {
			return replyCallback({
				content: String(result).replace('$', ''),
				embeds: [],
				components: [],
			});
		}

		// Is object.
		if (typeof result === 'object' && !Array.isArray(result)) {
			return replyCallback(result);
		}

		// Is array.
		if (Array.isArray(result)) {
			return replyCallback({
				content: result.join(', '),
				embeds: [],
				components: [],
			});
		}
	}

	private getReplyMethod(
		interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction,
		result: string,
	) {
		if (interaction.replied && result.startsWith('$')) return interaction.followUp.bind(interaction);
		if (interaction.replied) return interaction.editReply.bind(interaction);
		if (interaction.deferred) return interaction.editReply.bind(interaction);
		return interaction.reply.bind(interaction);
	}

	private async verifyAuthentication(client: Client, auth: IAuthFunctionItem[], user: User, guildId: string | null) {

		// Get the guild member if available.
		let guildMember: GuildMember | null = null;
		if (guildId) {
			guildMember = await client.guilds.cache.get(guildId)?.members.fetch(user.id) ?? null;
		}

		// Loop the auth items and get the output.
		return (await Promise.all(auth.map(async item => {
			const member = item.wants === 'guildmember' ? guildMember ?? user : user;
			return await item.callback(member);
		}))).every(Boolean);
	}
}
