import { CryptoHasher } from 'bun';
import { ec as EllipticCurve } from 'elliptic';
import KeyGenerator from '../keygenerator';

export default class CurrencyTransaction {
	public timestamp: number;
	public signature: string | null = null;

	public constructor(
		public keyGenerator: KeyGenerator,
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
		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');
		this.signature = sig.toDER('hex');
	}

	public isValid() {
		if (this.fromAddress === null) return true;

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const instance = this.keyGenerator.getInstance();
		const publicKey = instance.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}
