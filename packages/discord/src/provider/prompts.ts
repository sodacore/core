import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Colors, ContextMenuCommandInteraction, EmbedBuilder, InteractionCallbackResponse, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import { Provide } from '@sodacore/di';

export type IAllowedInteractionType = ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction;

export type IPromptsQuestionOptions = {
	timeout?: number,
	description?: string,
	ephemeral?: boolean,
	timestamp?: boolean,
	fields?: APIEmbedField[],
};

export type IPromptsConfirmOptions = IPromptsQuestionOptions & {
	acceptLabel?: string,
	rejectLabel?: string,
};

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

	public async choice() {
		// TODO.
	}

	public async input() {
		// TODO.
	}

	public async select() {
		// TODO.
	}

	public async modal() {
		// TODO.
	}
}
