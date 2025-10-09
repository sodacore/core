import { Command, Field, Interaction, On, SlashCommandBuilder } from '@sodacore/discord';
import { ChatInputCommandInteraction, LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

@Command(
	new SlashCommandBuilder()
		.setName('modal')
		.setDescription('Opens a modal!'),
)
export default class ModalCommand {

	@On.Command()
	public async onCommand(@Interaction() interaction: ChatInputCommandInteraction) {
		await interaction.showModal(
			new ModalBuilder()
				.setCustomId('modal1')
				.setTitle('Example Modal')
				.addLabelComponents(
					new LabelBuilder()
						.setLabel('What\'s your favorite color?')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('favoriteColorInput')
								.setStyle(TextInputStyle.Short),
						),
					new LabelBuilder()
						.setLabel('What\'s some of your favorite hobbies?')
						.setTextInputComponent(
							new TextInputBuilder()
								.setCustomId('hobbiesInput')
								.setStyle(TextInputStyle.Paragraph),
						),
					new LabelBuilder()
						.setLabel('Pick a colour')
						.setStringSelectMenuComponent(
							new StringSelectMenuBuilder()
								.setCustomId('colourSelect')
								.setPlaceholder('Nothing selected')
								.setMinValues(1)
								.setMaxValues(3)
								.addOptions(
									{ label: 'Red', value: 'red' },
									{ label: 'Blue', value: 'blue' },
									{ label: 'Green', value: 'green' },
									{ label: 'Yellow', value: 'yellow' },
									{ label: 'Black', value: 'black' },
								),
						),
				),
		);
	}

	@On.ModalSubmit('modal1')
	public async onButton(
		@Field('favoriteColorInput') favoriteColor: string,
		@Field('hobbiesInput') hobbies: string,
		@Field('colourSelect') color: string[],
	) {
		return `You selected ${favoriteColor} as your favorite color and your hobbies are: ${hobbies} and your favourite colours are: ${color.join(', ')}.`;
	}
}
