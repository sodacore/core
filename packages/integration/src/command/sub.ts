// import { Inject } from '@sodacore/di';
// import { Auth, Command, Interaction, On, Option, PromptsHelper, Query, SlashCommandBuilder } from '@sodacore/discord';
// import { PrismaClient } from '@sodacore/prisma';
// import type { ChatInputCommandInteraction } from 'discord.js';

// @Command(
// 	new SlashCommandBuilder()
// 		.setName('sub')
// 		.setDescription('Some sub commands.')
// 		.addSubcommand(sub =>
// 			sub
// 				.setName('subcommand1')
// 				.setDescription('Subcommand 1.')
// 				.addUserOption(option =>
// 					option
// 						.setName('user')
// 						.setDescription('Optional user to say hello to.')
// 						.setRequired(false),
// 				),
// 		)
// 		.addSubcommand(sub =>
// 			sub
// 				.setName('subcommand2')
// 				.setDescription('Subcommand 2.')
// 				.addStringOption(option =>
// 					option
// 						.setName('fruit')
// 						.setDescription('Choose a fruit.')
// 						.setRequired(true)
// 						.setAutocomplete(true),
// 				)
// 				.addStringOption(option =>
// 					option
// 						.setName('veggie')
// 						.setDescription('Choose a vegetable.')
// 						.setRequired(true)
// 						.setAutocomplete(true),
// 				),
// 		),
// )
// export default class SubCommand {
// 	@Inject() private prompts!: PromptsHelper;
// 	@Inject() private prisma!: PrismaClient;

// 	@On.Command()
// 	public async onCommand() {
// 		return 'Hello!';
// 	}

// 	@On.SubCommand('subcommand1')
// 	@Auth.HasRole('admin')
// 	public async onSubCommand1(@Interaction() interaction: ChatInputCommandInteraction) {
// 		const accepted = await this.prompts.confirm(interaction, 'Are you sure you want to say hello to this user?');
// 		if (!accepted) return 'Okay, I won\'t say hello.';
// 		return 'Hello!';
// 	}

// 	@On.SubCommand('subcommand2')
// 	public async onSubCommand2(@Option('fruit') fruit: string, @Option('veggie') veggie: string) {
// 		console.log(this.prisma);
// 		await this.prisma.user.create({
// 			data: {
// 				name: 'Test1',
// 				email: 'test1@example.com',
// 			},
// 		});
// 		return `You chose ${fruit} and ${veggie}.`;
// 	}

// 	@On.Autocomplete('fruit', 'subcommand2')
// 	public async onFruitAutocomplete(@Query() query: string) {
// 		return [
// 			{
// 				name: 'Apple',
// 				value: 'apple',
// 			},
// 			{
// 				name: 'Banana',
// 				value: 'banana',
// 			},
// 			{
// 				name: 'Cherry',
// 				value: 'cherry',
// 			},
// 			{
// 				name: 'Date',
// 				value: 'date',
// 			},
// 			{
// 				name: 'Elderberry',
// 				value: 'elderberry',
// 			},
// 		].filter(item => item.name.includes(String(query).toLowerCase()));
// 	}

// 	@On.Autocomplete('veggie', 'subcommand2')
// 	public async onVeggieAutocomplete(@Query() query: string) {
// 		return [
// 			{
// 				name: 'Asparagus',
// 				value: 'asparagus',
// 			},
// 			{
// 				name: 'Broccoli',
// 				value: 'broccoli',
// 			},
// 			{
// 				name: 'Carrot',
// 				value: 'carrot',
// 			},
// 			{
// 				name: 'Daikon',
// 				value: 'daikon',
// 			},
// 			{
// 				name: 'Eggplant',
// 				value: 'eggplant',
// 			},
// 		].filter(item => item.name.includes(String(query).toLowerCase()));
// 	}
// }
