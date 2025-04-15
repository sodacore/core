import { CryptoHasher } from 'bun';
import { ec as EllipticCurve } from 'elliptic';

const ec = new EllipticCurve('secp256k1');

export class Transaction {
	public timestamp: number;
	public signature: string = '';

	public constructor(
		public fromAddress: string | null,
		public toAddress: string,
		public amount: number,
	) {
		this.timestamp = Date.now();
	}

	public calculateHash() {
		const hasher = new CryptoHasher('sha256');
		hasher.update(
			this.fromAddress
			+ this.toAddress
			+ String(this.amount)
			+ String(this.timestamp),
		);
		return hasher.digest('hex');
	}

	public sign(signingKey: EllipticCurve.KeyPair) {
		// You can only send a transaction from the wallet that is linked to your
		// key. So here we check if the fromAddress matches your publicKey
		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		// Calculate the hash of this transaction, sign it with the key
		// and store it inside the transaction object
		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');

		this.signature = sig.toDER('hex');
	}

	public isValid() {
		// If the transaction doesn't have a from address we assume it's a
		// mining reward and that it's valid. You could verify this in a
		// different way (special field for instance)
		if (this.fromAddress === null) return true;

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}

export class Block {
	public nonce = 0;
	public hash: string;

	public constructor(
		public timestamp: number,
		public transactions: any[],
		public previousHash = '',
	) {
		this.previousHash = previousHash;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.hash = this.calculateHash();
	}

	public calculateHash() {
		const hasher = new CryptoHasher('sha256');
		hasher.update(
			this.previousHash
			+ this.timestamp
			+ JSON.stringify(this.transactions)
			+ this.nonce,
		);
		return hasher.digest('hex');
	}

	public mineBlock(difficulty: number) {
		while (
			this.hash.substring(0, difficulty) !== Array.from({ length: difficulty + 1 }).join('0')
		) {
			this.nonce++;
			this.hash = this.calculateHash();
		}

		console.log(`Block mined: ${this.hash}`);
	}

	public hasValidTransactions() {
		for (const tx of this.transactions) {
			if (!tx.isValid()) {
				return false;
			}
		}

		return true;
	}
}

export class Blockchain {
	public chain: Block[];
	public difficulty: number;
	public pendingTransactions: Transaction[];
	public miningReward: number;

	public constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	public createGenesisBlock() {
		return new Block(Date.parse('2017-01-01'), [], '0');
	}

	public getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	public minePendingTransactions(miningRewardAddress: string) {
		const rewardTx = new Transaction(
			null,
			miningRewardAddress,
			this.miningReward,
		);
		this.pendingTransactions.push(rewardTx);

		const block = new Block(
			Date.now(),
			this.pendingTransactions,
			this.getLatestBlock().hash,
		);
		block.mineBlock(this.difficulty);

		console.log('Block successfully mined!');
		this.chain.push(block);

		this.pendingTransactions = [];
	}

	public addTransaction(transaction: Transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		// Verify the transactiion
		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

		if (transaction.amount <= 0) {
			throw new Error('Transaction amount should be higher than 0');
		}

		// Making sure that the amount sent is not greater than existing balance
		const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
		if (walletBalance < transaction.amount) {
			throw new Error('Not enough balance');
		}

		// Get all other pending transactions for the "from" wallet
		const pendingTxForWallet = this.pendingTransactions.filter(
			tx => tx.fromAddress === transaction.fromAddress,
		);

		// If the wallet has more pending transactions, calculate the total amount
		// of spend coins so far. If this exceeds the balance, we refuse to add this
		// transaction.
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
		console.log('transaction added', transaction);
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

		console.log('getBalanceOfAdrees', balance);
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

		console.log('get transactions for wallet count: %s', txs.length);
		return txs;
	}

	public isChainValid() {
		// Check if the Genesis block hasn't been tampered with by comparing
		// the output of createGenesisBlock with the first block on our chain
		const realGenesis = JSON.stringify(this.createGenesisBlock());

		if (realGenesis !== JSON.stringify(this.chain[0])) {
			return false;
		}

		// Check the remaining blocks on the chain to see if there hashes and
		// signatures are correct
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (previousBlock.hash !== currentBlock.previousHash) {
				return false;
			}

			if (!currentBlock.hasValidTransactions()) {
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}
		}

		return true;
	}
}
