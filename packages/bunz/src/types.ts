export type MaybePromise<T> = T | Promise<T>;
export type IFlagValue = string | number | boolean;

export type IArgument = {
	name: string,
	description: string,
	required?: boolean,
};

export type IFlag = {
	name: string,
	description: string,
	itemName?: string, // ??? THE FOOK IS THIS FOR AGAIN (I FORGOT)
};

export interface INamespace {
	aliases: string[],
	name: string,
	description: string,
	commands: ICommand[],
	validate: () => MaybePromise<boolean>,
	handle: (command: IParsedCommand) => MaybePromise<boolean>,
}

export interface ICommand {
	prefix?: string[],
	names: string[],
	aliases?: string[],
	description: string,
	arguments?: IArgument[],
	validate: () => MaybePromise<boolean>,
	execute: () => MaybePromise<boolean>,
};

export interface IParsedCommand {
	namespace: string,
	command: string,
	parameters: string[],
	flags: Record<string, IFlagValue>,
	_: string[],
};
