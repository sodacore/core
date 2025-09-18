import { APIEmbedField, ButtonInteraction, ChatInputCommandInteraction, ClientEventTypes, ClientOptions, ContextMenuCommandInteraction, GuildMember, InteractionContextType, ModalSubmitInteraction, Permissions, RestOrArray, SelectMenuInteraction, User } from 'discord.js';

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
	subCommand?: IDiscordOptionsSubCommand,
	options?: IDiscordOptionsGroup[],
};

export type IRouterControllerItem = {
	name: string | null,
	className: string,
	methods: IRouterControllerMethodItem[],
	options?: IDiscordOptions[],
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

export type IDiscordOptionChoice = {
	name: string,
	value: string | number,
	nameLocalizations?: Record<string, string>,
};

export type IDiscordOptionType = 'string' | 'number' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'mentionable' | 'attachment';

// Covers: Attachment, Boolean, Channel, Mentionable, Role, User.
export type IDiscordOptionsGeneric = {
	name: string,
	description?: string,
	required?: boolean,
	nameLocalizations?: Record<string, string>,
	descriptionLocalizations?: Record<string, string>,
};

// Covers: Number, Integer.
export type IDiscordOptionsExtended = IDiscordOptionsGeneric & {
	choices?: IDiscordOptionChoice[],
	autocomplete?: boolean,
	minValue?: number,
	maxValue?: number,
};

// Covers String.
export type IDiscordOptionsString = Omit<IDiscordOptionsExtended, 'minValue' | 'maxValue'> & {
	minLength?: number,
	maxLength?: number,
};

// Covers : Command.
export type IDiscordOptionsCommand = Omit<IDiscordOptionsGeneric, 'required'> & {
	contexts?: RestOrArray<InteractionContextType>,
	defaultMemberPermissions?: Permissions | bigint | number | null | undefined,
	// integrationTypes?: unknown,
	nsfw?: boolean,
};

// Covers: any.
export type IDiscordOptions = IDiscordOptionsGeneric | IDiscordOptionsExtended | IDiscordOptionsString;

// Covers: SubCommand.
export type IDiscordOptionsSubCommand = Omit<IDiscordOptionsGeneric, 'required'>;

export type IDiscordOptionsGroup = {
	type: IDiscordOptionType,
	options: IDiscordOptions,
};

export type IDiscordOptionsCommandWithExtra = IDiscordOptionsCommand & {
	subCommands?: IDiscordOptionsSubCommand[],
}
