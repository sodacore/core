// import { Command, Field, Interaction, On, SlashCommandBuilder } from '@sodacore/discord';
// import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

// @Command(
// 	new SlashCommandBuilder()
// 		.setName('modal')
// 		.setDescription('Opens a modal!'),
// )
// export default class ModalCommand {

// 	@On.Command()
// 	public async onCommand(@Interaction() interaction: ChatInputCommandInteraction) {
// 		await interaction.showModal(
// 			new ModalBuilder()
// 				.setCustomId('modal1')
// 				.setTitle('Example Modal')
// 				.addComponents(
// 					new ActionRowBuilder<TextInputBuilder>()
// 						.addComponents(
// 							new TextInputBuilder()
// 								.setCustomId('favoriteColorInput')
// 								.setLabel('What\'s your favorite color?')
// 								.setStyle(TextInputStyle.Short),
// 						),
// 					new ActionRowBuilder<TextInputBuilder>()
// 						.addComponents(
// 							new TextInputBuilder()
// 								.setCustomId('hobbiesInput')
// 								.setLabel('What\'s some of your favorite hobbies?')
// 								.setStyle(TextInputStyle.Paragraph),
// 						),
// 				),
// 		);
// 	}

// 	@On.ModalSubmit('modal1')
// 	public async onButton(
// 		@Field('favoriteColorInput') favoriteColor: string,
// 		@Field('hobbiesInput') hobbies: string,
// 	) {
// 		return `You selected ${favoriteColor} as your favorite color and your hobbies are: ${hobbies}`;
// 	}
// }
