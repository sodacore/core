export function getFiles(packages: string[]) {
	return [
		{
			package: '@sodacore/core@alpha',
			path: './src/main.ts',
			content: `
import { Application } from '@sodacore/core';
import { env } from 'bun';
${packages.includes('@sodacore/http@alpha') ? `import HttpPlugin from '@sodacore/http';` : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? `import DiscordPlugin from '@sodacore/discord';` : '/*REMOVE*/'}
${packages.includes('@sodacore/prisma@alpha') ? `import PrismaPlugin from '@sodacore/prisma';` : '/*REMOVE*/'}
${packages.includes('@sodacore/cli@alpha') ? `import CliPlugin from '@sodacore/cli';` : '/*REMOVE*/'}
\n// Initialise application.
const app = new Application({
	autowire: true,
});
${packages.includes('@sodacore/http@alpha') ? `\n// Install the HTTP plugin.\napp.use(new HttpPlugin({\n\tport: 3110,\n}));` : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? `\n// Install the Discord plugin.\napp.use(new DiscordPlugin({\n\ttoken: env.DISCORD_TOKEN,\n\tclientId: env.DISCORD_CLIENT_ID,\n\tguildId: env.DISCORD_GUILD_ID,\n}));` : '/*REMOVE*/'}
${packages.includes('@sodacore/prisma@alpha') ? `\n// Install the Prisma plugin.\napp.use(new PrismaPlugin());` : '/*REMOVE*/'}
${packages.includes('@sodacore/cli@alpha') ? `\n// Install the CLI plugin.\napp.use(new CliPlugin({\n\tport: env.CLI_PORT,\n\thost: env.CLI_HOST,\n\tpass: env.CLI_PASS\n}));'` : '/*REMOVE*/'}
\n// Start the application.
app.start().catch(console.error);
			`.trim().replaceAll('\n/*REMOVE*/', ''),
		},
		{
			package: '@sodacore/core@alpha',
			path: './tsconfig.json',
			content: `
{
	"compilerOptions": {

		// Enable latest features
		"lib": ["ESNext"],
		"target": "ESNext",
		"module": "ESNext",
		"moduleDetection": "force",
		"jsx": "react-jsx",
		"allowJs": true,

		// Bundler mode
		"moduleResolution": "bundler",
		"allowImportingTsExtensions": true,
		"verbatimModuleSyntax": true,
		"noEmit": true,

		// Best practices
		"strict": true,
		"skipLibCheck": true,
		"noFallthroughCasesInSwitch": true,

		// Some stricter flags (disabled by default)
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noPropertyAccessFromIndexSignature": false,

		// Build.
		"declaration": true,
		"declarationMap": true,
		"esModuleInterop": true,

		// Decorators.
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true,
		"useDefineForClassFields": false,
	}
}
			`,
		},
		{
			package: '@sodacore/http@alpha',
			path: './src/controller/http.ts',
			content: `
import { Controller, Get } from '@sodacore/http';

@Controller('/')
export class HomeController {

	@Get('/')
	public async index() {
		return 'Hello world!';
	}
}
			`,
		},
		{
			package: '@sodacore/discord@alpha',
			path: './src/command/home.ts',
			content: `
import { Command, Interaction, On, SlashCommandBuilder } from '@sodacore/discord';
import { ChatInputCommandInteraction } from 'discord.js';

@Command(
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping the bot!'),
)
export class PingCommand {

	@On.Command()
	public async onCommand(@Interaction() interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
	}
}
			`,
		},
		{
			package: '@sodacore/discord@alpha',
			path: './src/providers/discord.ts',
			content: `
import { SlashCommandProvider } from '@sodacore/discord';
import { Provide, Inject } from '@sodacore/di';

@Provide()
export class DiscordProvider {
	@Inject() private slashCommands!: SlashCommandProvider;

	public async register() {
		await this.slashCommands.register();
	}

	public async unregister() {
		await this.slashCommands.unregister();
	}
}
			`,
		},
	];
}
