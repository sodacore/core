export type IConfig = {
	schemaFileLocation?: string, // Only use if the automatic resolver fails.
	onInit?: (prisma: any) => void | Promise<void>,
};

export type IPrismaClient = {
	$connect: () => Promise<void>,
	$disconnect: () => Promise<void>,
	[model: string]: any, // Dynamic model access
};
