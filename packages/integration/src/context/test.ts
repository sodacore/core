import { type MessageContextMenuCommandInteraction, MessageFlags, type UserContextMenuCommandInteraction } from 'discord.js';
import { Add, Auth, ContextMenu, Interaction } from '@sodacore/discord';

@ContextMenu()
export default class TestContextMenu {

	@Add.UserContext('Send Hello')
	public async sendHello(@Interaction() interaction: UserContextMenuCommandInteraction) {
		await interaction.reply({
			content: `Hello, ${interaction.targetUser.username}!`,
			flags: MessageFlags.Ephemeral,
		});
	}

	@Add.MessageContext('Get Message Content')
	@Auth.HasRole('something')
	public async getMessageContent(@Interaction() interaction: MessageContextMenuCommandInteraction) {
		await interaction.reply({
			content: `Message content: ${interaction.targetMessage.content}`,
			flags: MessageFlags.Ephemeral,
		});
	}
}
