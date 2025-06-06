import { Inject } from '@sodacore/di';
import { Command, Interaction, On, PromptsHelper, SlashCommandBuilder } from '@sodacore/discord';
import { ChatInputCommandInteraction } from 'discord.js';

@Command(
	new SlashCommandBuilder()
		.setName('test')
		.setDescription('General test functionality!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('confirm')
				.setDescription('Test the confirm prompt'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('choice')
				.setDescription('Test the choice prompt'),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modal')
				.setDescription('Test the modal prompt'),
		),
)
export default class TestCommand {
	@Inject() private prompts!: PromptsHelper;

	@On.SubCommand('confirm')
	public async onCommand(@Interaction() interaction: ChatInputCommandInteraction) {
		const status = await this.prompts.confirm(interaction, 'Are you sure you want to say hello to this user?', {
			acceptLabel: 'DO IT',
			rejectLabel: 'NO WAY',
			timeout: 5_000,
		});
		if (!status) return 'Okay, I won\'t say hello.';
		return 'Hello!';
	}

	@On.SubCommand('choice')
	public async onChoice(@Interaction() interaction: ChatInputCommandInteraction) {
		const choice = await this.prompts.choice(interaction, 'What is your favourite colour?', [
			{ label: 'Red', value: 'red' },
			{ label: 'Green', value: 'green' },
			{ label: 'Blue', value: 'blue' },
		]);
		return `You selected: ${choice}`;
	}

	@On.SubCommand('modal')
	public async onModal(@Interaction() interaction: ChatInputCommandInteraction) {
		const data = await this.prompts.modal(interaction, 'Test Modal');
		return `You submitted: ${JSON.stringify(data)}`;
	}
}
