import { ClientEventTypes, ClientOptions, GuildMember, User } from 'discord.js';

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
