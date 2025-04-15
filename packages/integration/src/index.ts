import { Application } from '@sodacore/core';
import HttpPlugin from '@sodacore/http';
import DiscordPlugin from '@sodacore/discord';
import PrismaPlugin from '@sodacore/prisma';
import { env } from 'bun';
import { GatewayIntentBits } from 'discord.js';

// Initialise application.
const app = new Application({
	autowire: true,
	password: 'test123',
	hostname: '0.0.0.0',
	enableCli: true,
});

// Install the Prisma plugin.
app.use(new PrismaPlugin({
	// onInit: prisma => {
	// 	console.log('Prisma client initialised.', typeof prisma.user);
	// },
}));

// Install the HTTP plugin.
app.use(new HttpPlugin({
	port: 3101,
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
