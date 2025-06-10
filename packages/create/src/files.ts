export function getFiles(packages: string[]) {
	return [
		{
			package: '@sodacore/core@alpha',
			path: './src/main.ts',
			content: `
import { Application } from '@sodacore/core';
import { env } from 'bun';
import { resolve } from 'node:path';
import process from 'node:process';
${packages.includes('@sodacore/http@alpha') ? `import HttpPlugin from '@sodacore/http';` : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? `import DiscordPlugin from '@sodacore/discord';` : '/*REMOVE*/'}
${packages.includes('@sodacore/cli@alpha') ? `import CliPlugin from '@sodacore/cli';` : '/*REMOVE*/'}
${packages.includes('@sodacore/i18n@alpha') ? `import I18nPlugin from '@sodacore/i18n';` : '/*REMOVE*/'}
${packages.includes('@sodacore/ws@alpha') ? `import WsPlugin from '@sodacore/ws';` : '/*REMOVE*/'}
\n// Initialise application.
const app = new Application({
	autowire: true,
	basePath: env.SODACORE_ENV === 'prod'
		? resolve(process.cwd(), './dist')
		: undefined,
});
${packages.includes('@sodacore/http@alpha') ? `\n// Install the HTTP plugin.\napp.use(new HttpPlugin({\n\tport: Number.parseInt(env.HTTP_PORT),\n}));` : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? `\n// Install the Discord plugin.\napp.use(new DiscordPlugin({\n\ttoken: env.DISCORD_TOKEN,\n\tclientId: env.DISCORD_CLIENT_ID,\n\tguildId: env.DISCORD_GUILD_ID,\n}));` : '/*REMOVE*/'}
${packages.includes('@sodacore/cli@alpha') ? `\n// Install the CLI plugin.\napp.use(new CliPlugin({\n\tport: env.CLI_PORT,\n\thost: env.CLI_HOST,\n\tpass: env.CLI_PASS\n}));'` : '/*REMOVE*/'}
${packages.includes('@sodacore/prisma@alpha') ? `\n// Install the Prisma plugin.\n// You will need to generate the prisma client and set the path.\n// The path will default to @prisma/client, otherwise set it below.\n// app.use(new PrismaPlugin({\n//\tgeneratedClientPath: './prisma/prisma/client',\n// }));` : '/*REMOVE*/'}
${packages.includes('@sodacore/i18n@alpha') ? `\n// Install the I18n plugin.\napp.use(new I18nPlugin({\n\tdefaultLocale: 'en-GB',\n}));` : '/*REMOVE*/'}
${packages.includes('@sodacore/ws@alpha') ? `\n// Install the WebSocket plugin.\napp.use(new WsPlugin({\n\tpath: env.WS_PATH,\n}));` : '/*REMOVE*/'}
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
		"outDir": "./dist",

		// Bundler mode
		"moduleResolution": "bundler",
		"verbatimModuleSyntax": true,
		"noEmit": false,

		// Best practices
		"strict": true,
		"skipLibCheck": true,
		"noFallthroughCasesInSwitch": true,

		// Some stricter flags (disabled by default)
		"noUnusedLocals": true,
		"noUnusedParameters": false,
		"noPropertyAccessFromIndexSignature": false,

		// Build.
		"declaration": true,
		"declarationMap": true,
		"esModuleInterop": true,

		// Decorators.
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true,
		"useDefineForClassFields": false,
	},
	"include": [
		"src/**/*.ts",
		"src/**/*.tsx",
	],
}

			`,
		},
		{
			package: '@sodacore/http@alpha',
			path: './src/controller/http.ts',
			content: `
import { Controller, Get } from '@sodacore/http';
${packages.includes('@sodacore/i18n@alpha') ? `import { I18nProvider } from '@sodacore/i18n';\nimport { Inject } from '@sodacore/di';\n` : '\n'}
@Controller('/')
export class HomeController {
	${packages.includes('@sodacore/i18n@alpha') ? `@Inject() private i18n!: I18nProvider;\n` : '\n'}
	@Get('/')
	public async index() {
		${packages.includes('@sodacore/i18n@alpha') ? `return this.i18n.autoTranslate('_t(Hello, World)!')` : `return 'Hello, World!'`};
	}
}
			`,
		},
		{
			package: '@sodacore/ws@alpha',
			path: './src/controller/ping.ts',
			content: `
import { Controller, Expose } from '@sodacore/ws';

@Controller('ping')
export class PingController {

	@Expose('ping')
	public ping() {
		return 'pong';
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
			package: '@sodacore/core@alpha',
			path: './.env',
			content: `
CLI_PASSWORD="YOUR_SUPER_SECURE_PASSWORD"
${packages.includes('@sodacore/ws@alpha') ? 'WS_PATH="/ws"' : '/*REMOVE*/'}
${packages.includes('@sodacore/http@alpha') ? 'HTTP_PORT=3110' : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? 'DISCORD_TOKEN="YOUR_DISCORD_TOKEN"' : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? 'DISCORD_CLIENT_ID="YOUR_DISCORD_CLIENT_ID"' : '/*REMOVE*/'}
${packages.includes('@sodacore/discord@alpha') ? 'DISCORD_GUILD_ID="YOUR_DISCORD_GUILD_ID"' : '/*REMOVE*/'}
			`,
		},
	];
}
