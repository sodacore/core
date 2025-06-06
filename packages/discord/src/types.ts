import { APIEmbedField, ButtonInteraction, ChatInputCommandInteraction, ClientEventTypes, ClientOptions, ContextMenuCommandInteraction, GuildMember, ModalSubmitInteraction, SelectMenuInteraction, User } from 'discord.js';

export type IAuthFunctionUser = (user: User) => boolean | Promise<boolean>;
export type IAuthFunctionGuildMember = (user: GuildMember) => boolean | Promise<boolean>;
export type IAuthFunction = (user: User | GuildMember) => boolean | Promise<boolean>;

export type IConfig = {
	token?: string,
	clientId?: string,
	clientSecret?: string,
	baseUrl?: string,
	scopes?: string[],
	guildId?: string,
	clientOptions?: ClientOptions,
	events?: Array<keyof ClientEventTypes>,
	commandRegisterLocation?: 'guild' | 'global',
};

export type IAuthFunctionItem = {
	wants: 'user' | 'guildmember',
	callback: IAuthFunction,
};

export type IRouterControllerMethodItem = {
	key: string,
	unique: string | boolean,
	type: string,
	subType?: string,
	auth: IAuthFunctionItem[],
};

export type IRouterControllerItem = {
	name: string | null,
	className: string,
	methods: IRouterControllerMethodItem[],
	module: any,
};

export type IControllerMethodArgItem = {
	type: 'interaction' | 'user' | 'channel' | 'guild' | 'client' | 'query' | 'option' | 'field',
	index: number,
	name?: string,
	format?: boolean,
};

export type ITokenResult = {
	tokenType: string,
	expiresIn: number,
	refreshToken: string,
	accessToken: string,
	scope: string,
};

export type IPromptChoiceItem = {
	label: string,
	value: string,
};

export type IAllowedInteractionType = ChatInputCommandInteraction | ButtonInteraction | SelectMenuInteraction | ContextMenuCommandInteraction | ModalSubmitInteraction;

export type IPromptsQuestionOptions = {
	timeout?: number,
	description?: string,
	ephemeral?: boolean,
	timestamp?: boolean,
	fields?: APIEmbedField[],
};

export type IPromptsConfirmOptions = IPromptsQuestionOptions & {
	acceptLabel?: string,
	rejectLabel?: string,
};

export type IPromptsChoiceOptions = IPromptsQuestionOptions & {
	placeholder?: string,
};

// export type IPrompts
