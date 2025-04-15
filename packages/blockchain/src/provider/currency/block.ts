import { CryptoHasher } from 'bun';

export default class CurrencyBlock {
	public nonce: number;
	public hash: string;

	public constructor(
		public timestamp: number,
		public transactions: any[],
		public previousHash = '',
	) {
		this.nonce = 0;
		this.hash = this.calculateHash();
	}

	public calculateHash() {
		const hasher = new CryptoHasher('sha256');
		hasher.update(
			String(this.previousHash)
			+ String(this.timestamp)
			+ JSON.stringify(this.transactions)
			+ String(this.nonce),
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

		console.info(`Block mined: ${this.hash}`);
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
