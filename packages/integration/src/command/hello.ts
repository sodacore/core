// import { Command, Interaction, On, SlashCommandBuilder } from '@sodacore/discord';
// import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

// @Command(
// 	new SlashCommandBuilder()
// 		.setName('hello')
// 		.setDescription('Replies with Hello!')
// 		.addUserOption(option =>
// 			option
// 				.setName('user')
// 				.setDescription('Optional user to say hello to.')
// 				.setRequired(false),
// 		),
// )
// export default class HelloCommand {

// 	@On.Command()
// 	public async onCommand(@Interaction() interaction: ChatInputCommandInteraction) {
// 		const row1 = new ActionRowBuilder();
// 		row1.addComponents(
// 			new ButtonBuilder()
// 				.setCustomId('button1')
// 				.setLabel('Button 1')
// 				.setStyle(ButtonStyle.Primary),
// 		);

// 		const row2 = new ActionRowBuilder();
// 		row2.addComponents(
// 			new StringSelectMenuBuilder()
// 				.setCustomId('select1')
// 				.setPlaceholder('Select 1')
// 				.addOptions(
// 					new StringSelectMenuOptionBuilder()
// 						.setLabel('Option 1')
// 						.setDescription('The dual-type Grass/Poison Seed Pokémon.')
// 						.setValue('option1'),
// 					new StringSelectMenuOptionBuilder()
// 						.setLabel('Option 2')
// 						.setDescription('The Fire-type Lizard Pokémon.')
// 						.setValue('option2'),
// 					new StringSelectMenuOptionBuilder()
// 						.setLabel('Option 3')
// 						.setDescription('The Water-type Tiny Turtle Pokémon.')
// 						.setValue('option3'),
// 					new StringSelectMenuOptionBuilder()
// 						.setLabel('Option 4')
// 						.setDescription('The dual-type Grass/Poison Seed Pokémon.')
// 						.setValue('option4'),
// 					new StringSelectMenuOptionBuilder()
// 						.setLabel('Option 5')
// 						.setDescription('The Fire-type Lizard Pokémon.')
// 						.setValue('option5'),
// 				),
// 		);

// 		await interaction.reply({
// 			content: 'Choose some stuffs.',
// 			components: [row1, row2],
// 		});
// 	}

// 	@On.Button('button1')
// 	public async onButton(@Interaction() interaction: ButtonInteraction) {
// 		await interaction.reply('Button clicked!');
// 	}

// 	@On.SelectMenu('select1')
// 	public async onSelectMenu(@Interaction() interaction: ButtonInteraction) {
// 		await interaction.reply('Select menu clicked!');
// 	}
// }
