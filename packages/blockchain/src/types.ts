// eslint-disable-next-line ts/no-empty-object-type
export type IConfig = {
	//
};

export type ITransaction = {
	fromAddress: string,
	toAddress: string,
	// Need to figure out what we want to store here.
};

export type IBlock = {
	hash: string,
	nonce: number,
	timestamp: number,
	previousHash: string,
	transactions: ITransaction[],
};

export type IContract = {
	owner: string,
	name: string,
	description: string,
	data: Record<string, any>,
	abi: IContractAbi[],
};

export type IContractAbi = {
	inputs: IContractAbiInput[],
	outputs: IContractAbiInput[],
};

export type IContractAbiInput = {
	name: string,
	type: string,
};

/*

{
	inputs: [
		{
			name: '',
			type: '',
		},
	],
	outputs: [
		{
			name: '',
			type: '',
		},
	],
	name: {}
}

*/
