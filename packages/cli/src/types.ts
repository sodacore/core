export type IConfigConnectionItem = {
	host: string,
	port: number,
	pass: string,
	name?: string,
};

export type IConfigCli = {
	connections: IConfigConnectionItem[],
};

export type ISocketData = {
	uid: string,
	authenticated?: boolean,
};
