import { Option, SlashCommand, StringOption, SubCommand, UserOption } from '@sodacore/discord';

@SlashCommand({ name: 'custom', description: 'Custom command example.' })
export class CustomCommand1 {

	@SubCommand({ name: 'sub1', description: 'Sub command 1 example.' })
	@UserOption({ name: 'friend', description: 'Choose your friend.' })
	@StringOption({ name: 'message', description: 'Your message to your friend.' })
	public async execute(
		@Option('message') message?: string,
		@Option('friend') friend?: number,
	) {
		return `Hello, ${friend ? `<@${friend}>` : 'World'}! ${message || ''}`;
	}
}
