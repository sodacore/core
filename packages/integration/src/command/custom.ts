import { On, Option, SlashCommand, StringOption, SubCommand, UserOption } from '@sodacore/discord';

@SlashCommand({ name: 'custom', description: 'Custom command example.' })
export class CustomCommand1 {

	@SubCommand({ name: 'sub1', description: 'Sub command 1 example.' })
	@UserOption({ name: 'friend', description: 'Choose your friend.' })
	@StringOption({ name: 'message', description: 'Your message to your friend.', autocomplete: true })
	public async execute(
		@Option('message') message?: string,
		@Option('friend') friend?: number,
	) {
		return `Hello, ${friend ? `<@${friend}>` : 'World'}! ${message || ''}`;
	}

	@On.Autocomplete('message')
	public async onAutocomplete(
		@Option('message') message: string,
	) {
		const suggestions = [
			'Hello there!',
			'How are you?',
			'Have a great day!',
			'What\'s up?',
			'Good to see you!',
		].filter(s => s.toLowerCase().includes(message.toLowerCase())).slice(0, 5);

		return suggestions.map(s => ({ name: s, value: s }));
	}
}
