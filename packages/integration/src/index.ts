import { Application } from '@sodacore/core';
import HttpPlugin from '@sodacore/http';
import DiscordPlugin from '@sodacore/discord';
import WsPlugin from '@sodacore/ws';
import I18nPlugin from '@sodacore/i18n';
import PrismaPlugin from '@sodacore/prisma';
import { GatewayIntentBits } from 'discord.js';
import { env } from 'bun';

// Initialise application.
const app = new Application({
	autowire: true,
	password: 'test123',
	hostname: '127.0.0.1',
	enableCli: true,
});

// Install the Prisma plugin.
app.use(new PrismaPlugin({
	schemaFileLocation: './prisma/schema/schema.prisma',
}));

// Install the HTTP plugin.
app.use(new HttpPlugin({
	port: 3101,
	builtin: {
		rateLimitMiddleware: true,
	},
}));

// Install the WebSocket plugin.
app.use(new WsPlugin({
	publishToSelf: true,
}));

// Install the i18n plugin.
app.use(new I18nPlugin({
	defaultLocale: 'en',
	enableFileLookup: true,
	overrideGetParam: 'locale',
}));

app.use(new DiscordPlugin({
	token: env.DISCORD_TOKEN,
	clientId: env.DISCORD_CLIENT_ID,
	clientSecret: env.DISCORD_CLIENT_SECRET,
	scopes: ['identify', 'email', 'guilds'],
	baseUrl: env.DISCORD_BASE_URL,
	guildId: env.DISCORD_GUILD_ID,
	events: ['messageCreate'],
	clientOptions: {
		intents: [
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildMessageTyping,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.GuildScheduledEvents,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildModeration,
			GatewayIntentBits.GuildExpressions,
			GatewayIntentBits.MessageContent,
		],
	},
}));

// Start the application.
app.start().catch(console.error);
