import KeyGenerator from '../keygenerator';
import CurrencyBlock from './block';
import CurrencyTransaction from './transaction';

export default class CurrencyBlockchain {
	public chain: any[] = [];
	public difficulty: number;
	public pendingTransactions: any[];
	public miningReward: number;

	public constructor(
		private keyGenerator: KeyGenerator,
	) {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	public createGenesisBlock() {
		return new CurrencyBlock(Date.now(), [], '0');
	}

	public getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	public minePendingTransactions(miningRewardAddress: string) {
		const rewardTx = new CurrencyTransaction(this.keyGenerator, null, miningRewardAddress, this.miningReward);
		this.pendingTransactions.push(rewardTx);

		const block = new CurrencyBlock(
			Date.now(),
			this.pendingTransactions,
			this.getLatestBlock().hash,
		);

		block.mineBlock(this.difficulty);
		this.chain.push(block);
		this.pendingTransactions = [];
	}

	public addTransaction(transaction: CurrencyTransaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

		if (transaction.amount <= 0) {
			throw new Error('Transaction amount should be higher than 0');
		}

		const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
		if (walletBalance < transaction.amount) {
			throw new Error('Not enough balance');
		}

		const pendingTxForWallet = this.pendingTransactions.filter(
			tx => tx.fromAddress === transaction.fromAddress,
		);

		if (pendingTxForWallet.length > 0) {
			const totalPendingAmount = pendingTxForWallet
				.map(tx => tx.amount)
				.reduce((prev, curr) => prev + curr);

			const totalAmount = totalPendingAmount + transaction.amount;
			if (totalAmount > walletBalance) {
				throw new Error(
					'Pending transactions for this wallet is higher than its balance.',
				);
			}
		}

		this.pendingTransactions.push(transaction);
	}

	public getBalanceOfAddress(address: string) {
		let balance = 0;

		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if (trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
	}

	public getAllTransactionsForWallet(address: string) {
		const txs = [];

		for (const block of this.chain) {
			for (const tx of block.transactions) {
				if (tx.fromAddress === address || tx.toAddress === address) {
					txs.push(tx);
				}
			}
		}

		return txs;
	}

	public isChainValid() {
		// const realGenesis = JSON.stringify(this.createGenesisBlock());
		// console.log(realGenesis, JSON.stringify(this.chain[0]));

		// if (realGenesis !== JSON.stringify(this.chain[0])) {
		// 	console.log('A');
		// 	return false;
		// }

		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (previousBlock.hash !== currentBlock.previousHash) {
				console.log('B', previousBlock.hash, currentBlock.previousHash);
				return false;
			}

			if (!currentBlock.hasValidTransactions()) {
				console.log('C', currentBlock.hasValidTransactions());
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				console.log('D', currentBlock.hash, currentBlock.calculateHash());
				return false;
			}
		}

		return true;
	}
}
