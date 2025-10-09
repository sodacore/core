import type {
	IAllowedInteractionType,
	IAuthFunction,
	IAuthFunctionGuildMember,
	IAuthFunctionItem,
	IAuthFunctionUser,
	IConfig,
	IControllerMethodArgItem,
	IDiscordOptionChoice,
	IDiscordOptions,
	IDiscordOptionsCommand,
	IDiscordOptionsExtended,
	IDiscordOptionsGeneric,
	IDiscordOptionsGroup,
	IDiscordOptionsString,
	IDiscordOptionsSubCommand,
	IDiscordOptionType,
	IPromptChoiceItem,
	IPromptsChoiceOptions,
	IPromptsConfirmOptions,
	IPromptsQuestionOptions,
	IRouterControllerItem,
	IRouterControllerMethodItem,
	ITokenResult,
} from './types';

import { IntentsBitField, SlashCommandBuilder } from 'discord.js';
import * as Add from './decorator/add';
import * as Auth from './decorator/auth';
import { Command, ContextMenu, Event, Handler } from './decorator/command';
import { Channel, Client, Field, Guild, Interaction, Option, Query, User } from './decorator/context';
import { AttachmentOption, BooleanOption, ChannelOption, IntegerOption, MentionableOption, NumberOption, RoleOption, SlashCommand, StringOption, SubCommand, UserOption } from './decorator/slash-commands';
import * as On from './decorator/on';
import DiscordPlugin from './module/plugin';
import DiscordService from './service/discord';
import SlashCommandsProvider from './provider/slash-commands';
import DiscordScripts from './script/general';
import OAuthProvider from './provider/oauth';

export default DiscordPlugin;

export {
	Add,
	AttachmentOption,
	Auth,
	BooleanOption,
	Channel,
	ChannelOption,
	Client,
	Command,
	ContextMenu,
	DiscordScripts,
	DiscordService,
	Event,
	Field,
	Guild,
	Handler,
	IntegerOption,
	IntentsBitField,
	Interaction,
	MentionableOption,
	NumberOption,
	OAuthProvider,
	On,
	Option,
	Query,
	RoleOption,
	SlashCommand,
	SlashCommandBuilder,
	SlashCommandsProvider,
	StringOption,
	SubCommand,
	User,
	UserOption,
};

export type {
	IAllowedInteractionType,
	IAuthFunction,
	IAuthFunctionGuildMember,
	IAuthFunctionItem,
	IAuthFunctionUser,
	IConfig,
	IControllerMethodArgItem,
	IDiscordOptionChoice,
	IDiscordOptions,
	IDiscordOptionsCommand,
	IDiscordOptionsExtended,
	IDiscordOptionsGeneric,
	IDiscordOptionsGroup,
	IDiscordOptionsString,
	IDiscordOptionsSubCommand,
	IDiscordOptionType,
	IPromptChoiceItem,
	IPromptsChoiceOptions,
	IPromptsConfirmOptions,
	IPromptsQuestionOptions,
	IRouterControllerItem,
	IRouterControllerMethodItem,
	ITokenResult,
};
