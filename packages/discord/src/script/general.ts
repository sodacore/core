import type { IConfig } from '../types';
import { AsScript, Namespace, Script, ScriptContext } from '@sodacore/core';
import { Inject } from '@sodacore/di';
import SlashCommandsProvider from '../provider/slash-commands';

@Namespace('discord')
export default class DiscordScripts implements AsScript<DiscordScripts> {
	@Inject('@discord:config') private config!: IConfig;
	@Inject() private slashCommands!: SlashCommandsProvider;

	@Script('commands:register')
	public async register(context: ScriptContext) {

		// Let's ask the user what they want to register for?
		const registerFor = await context.prompts.select({
			message: 'Where do you want to register the commands?',
			options: [
				{ value: 'global', label: 'Global (Application)' },
				{ value: 'guild', label: 'Specific Guild' },
			],
		});
		if (!registerFor) return 'Operation could not be completed, no result provided.';

		// Check for global, and if so, register the commands globally.
		if (registerFor === 'global') {
			const count = await this.slashCommands.registerGlobal();
			return `Successfully registered ${count} global (/) commands.`;
		}

		// If not, let's ask for the Guild ID, use the default config if not provided.
		const guildId = await context.prompts.text({
			message: 'What guild ID do you want to use?',
			defaultValue: this.config.guildId,
			initialValue: this.config.guildId,
			placeholder: this.config.guildId,
		});
		if (!guildId) return 'Operation could not be completed, no result provided.';

		// Register the commands to the guild ID.
		const count = await this.slashCommands.registerGuild(guildId);

		// Return success.
		return `Successfully registered ${count} (/) commands to guild ID: ${guildId}.`;
	}

	@Script('commands:unregister')
	public async unregister(context: ScriptContext) {

		// Let's ask the user what they want to register for?
		const registerFor = await context.prompts.select({
			message: 'Where do you want to unregister the commands from?',
			options: [
				{ value: 'global', label: 'Global (Application)' },
				{ value: 'guild', label: 'Specific Guild' },
			],
		});
		if (!registerFor) return 'Operation could not be completed, no result provided.';

		// Check for global, and if so, register the commands globally.
		if (registerFor === 'global') {
			const status = await this.slashCommands.unregisterGlobal();
			return status ? 'Successfully unregistered (/) commands.' : 'Operation failed.';
		}

		// If not, let's ask for the Guild ID, use the default config if not provided.
		const guildId = await context.prompts.text({
			message: 'What guild ID do you want to use?',
			defaultValue: this.config.guildId,
			initialValue: this.config.guildId,
			placeholder: this.config.guildId,
		});
		if (!guildId) return 'Operation could not be completed, no result provided.';

		// Register the commands to the guild ID.
		const status = await this.slashCommands.unregisterGuild(guildId);

		// Return status.
		return status ? `Successfully unregistered (/) commands from guild ID: ${guildId}.` : 'Operation failed.';
	}
}
