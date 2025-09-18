import type { IDiscordOptionsCommand, IDiscordOptionsExtended, IDiscordOptionsString, IDiscordOptionType, IRouterControllerMethodItem } from '../types';
import { SlashCommandBuilder } from 'discord.js';

export function toBuilder(
	root: IDiscordOptionsCommand,
	methods: IRouterControllerMethodItem[],
): SlashCommandBuilder {
	try {

		// Start with the root command.
		const builder = new SlashCommandBuilder().setName(root.name);
		if (root.description) builder.setDescription(root.description);
		if (root.nameLocalizations) builder.setNameLocalizations(root.nameLocalizations);
		if (root.descriptionLocalizations) builder.setDescriptionLocalizations(root.descriptionLocalizations);
		if (root.defaultMemberPermissions) builder.setDefaultMemberPermissions(root.defaultMemberPermissions);
		// if (root.integrationTypes) builder.setIntegrationTypes(root.integrationTypes); // Unknown.
		if (root.nsfw) builder.setNSFW(root.nsfw);

		// Now let's loop the methods.
		methods.forEach(method => {

			// If there is no sub command or options, throw an error.
			const sub = method.subCommand;
			const options = method.options ?? [];
			if (!sub) throw new Error(`Method ${method.key} has no sub command definition.`);

			// Firstly create the new sub command.
			builder.addSubcommand(subcommand => {
				subcommand.setName(sub.name);
				if (sub.description) subcommand.setDescription(sub.description);
				if (sub.nameLocalizations) subcommand.setNameLocalizations(sub.nameLocalizations);
				if (sub.descriptionLocalizations) subcommand.setDescriptionLocalizations(sub.descriptionLocalizations);

				// Now loop the options.
				options.forEach(option => {
					const methodName = getOptionMethod(option.type);
					subcommand[methodName]((opt: any) => {
						opt.setName(option.options.name);
						if (option.options.description) opt.setDescription(option.options.description);
						if (option.options.nameLocalizations) opt.setNameLocalizations(option.options.nameLocalizations);
						if (option.options.descriptionLocalizations) opt.setDescriptionLocalizations(option.options.descriptionLocalizations);
						if (option.options.required) opt.setRequired(option.options.required);

						const optionsExtended = option.options as IDiscordOptionsExtended;
						if (optionsExtended.choices) opt.addChoices(...optionsExtended.choices);
						if (optionsExtended.autocomplete) opt.setAutocomplete(optionsExtended.autocomplete);
						if (optionsExtended.minValue !== undefined) opt.setMinValue(optionsExtended.minValue);
						if (optionsExtended.maxValue !== undefined) opt.setMaxValue(optionsExtended.maxValue);

						const optionsString = option.options as IDiscordOptionsString;
						if (optionsString.minLength !== undefined) opt.setMinLength(optionsString.minLength);
						if (optionsString.maxLength !== undefined) opt.setMaxLength(optionsString.maxLength);

						return opt;
					});
				});

				return subcommand;
			});

			return builder;
		});

		return builder;
	} catch (err) {
		console.log(err);
		return new SlashCommandBuilder();
	}
}

export function getOptionMethod(type: IDiscordOptionType) {
	switch (type) {
		case 'attachment':
			return 'addAttachmentOption';
		case 'boolean':
			return 'addBooleanOption';
		case 'channel':
			return 'addChannelOption';
		case 'integer':
			return 'addIntegerOption';
		case 'mentionable':
			return 'addMentionableOption';
		case 'number':
			return 'addNumberOption';
		case 'role':
			return 'addRoleOption';
		case 'string':
			return 'addStringOption';
		case 'user':
			return 'addUserOption';
		default:
			throw new Error(`Unknown option type: ${type}`);
	}
}
