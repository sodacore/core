import type { IConfig } from './types';
import { GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import * as Add from './decorator/add';
import * as Auth from './decorator/auth';
import { Command, ContextMenu, Event, Handler } from './decorator/command';
import { Channel, Client, Field, Guild, Interaction, Option, Query, User } from './decorator/context';
import * as On from './decorator/on';
import DiscordPlugin from './module/plugin';
import DiscordService from './service/discord';
import SlashCommandsProvider from './provider/slash-commands';
import PromptsHelper from './provider/prompts';
import DiscordScripts from './script/general';
import OAuthProvider from './provider/oauth';

export default DiscordPlugin;

export {
	Add,
	Auth,
	Channel,
	Client,
	Command,
	ContextMenu,
	DiscordScripts,
	DiscordService,
	Event,
	Field,
	GatewayIntentBits,
	Guild,
	Handler,
	Interaction,
	OAuthProvider,
	On,
	Option,
	PromptsHelper,
	Query,
	SlashCommandBuilder,
	SlashCommandsProvider,
	User,
};

export type {
	IConfig,
};
