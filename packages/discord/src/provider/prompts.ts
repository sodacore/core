import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, InteractionCallbackResponse, SelectMenuBuilder } from 'discord.js';
import { Provide } from '@sodacore/di';
import { IAllowedInteractionType, IPromptChoiceItem, IPromptsChoiceOptions, IPromptsConfirmOptions } from '../types';

@Provide()
export default class PromptsHelper {

	public async confirm(interaction: IAllowedInteractionType, question: string, options?: IPromptsConfirmOptions) {

		// Define the interaction response.
		let response!: InteractionCallbackResponse;

		// Create an embed.
		const embed = new EmbedBuilder()
			.setTitle(question)
			.setColor(Colors.Green);

		// Check for a description.
		if (options?.description) embed.setDescription(options.description);
		if (options?.timestamp) embed.setTimestamp();
		if (options?.fields) embed.addFields(options.fields);

		// Create the buttons.
		const buttonRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('internal:confirm:accept')
					.setLabel(options?.acceptLabel || 'Yes')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('internal:confirm:reject')
					.setLabel(options?.rejectLabel || 'No')
					.setStyle(ButtonStyle.Danger),
			);

		// Send the message.
		if (interaction.replied) {
			await interaction.editReply({ embeds: [embed], components: [buttonRow] });
		} else {
			response = await interaction.reply({ embeds: [embed], components: [buttonRow], withResponse: true });
		}

		// Wait for the response.
		const result = await response.resource?.message?.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id,
			time: options?.timeout || 60000,
		});

		// Check the response.
		if (result?.customId === 'internal:confirm:accept') {
			return true;
		}

		return false;
	}

	public async choice(interaction: ChatInputCommandInteraction, question: string, choices: IPromptChoiceItem[], options?: IPromptsChoiceOptions) {

		// Define the interaction response.
		let response!: InteractionCallbackResponse;

		// Create an embed.
		const embed = new EmbedBuilder()
			.setTitle(question)
			.setColor(Colors.Orange);

		// Check for a description.
		if (options?.description) embed.setDescription(options.description);
		if (options?.timestamp) embed.setTimestamp();
		if (options?.fields) embed.addFields(options.fields);

		// Create the buttons.
		const choiceRow = new ActionRowBuilder<SelectMenuBuilder>()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('internal:choice:answer')
					.setPlaceholder(options?.placeholder || 'Select an option')
					.setOptions(choices),
			);

		// Send the message.
		if (interaction.replied) {
			await interaction.editReply({ embeds: [embed], components: [choiceRow] });
		} else {
			response = await interaction.reply({ embeds: [embed], components: [choiceRow], withResponse: true });
		}

		// Wait for the response.
		const result = await response.resource?.message?.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id,
			time: options?.timeout || 60000,
		});

		// Check the response.
		if (!result?.isSelectMenu()) return null;
		return result.values[0] ?? null;
	}
}
