export type IArgument = {
	name: string,
	description: string,
	required?: boolean,
}

export type IFlag = {
	name: string,
	description: string,
	itemName?: string,
}

export interface ICommand {
	name: string,
	description: string,
	arguments?: IArgument[],
	flags?: IFlag[],
	validate: () => Promise<boolean>,
	execute: () => Promise<boolean | string>,
}
