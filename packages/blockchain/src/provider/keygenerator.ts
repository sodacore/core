import { Provide } from '@sodacore/di';
import { ec as EllipticCurve } from 'elliptic';

@Provide()
export default class KeyGenerator {
	private instance: EllipticCurve;

	public constructor() {
		this.instance = new EllipticCurve('secp256k1');
	}

	public getInstance() {
		return this.instance;
	}

	public generateKeyPair() {
		const key = this.instance.genKeyPair();
		const publicKey = key.getPublic('hex');
		const privateKey = key.getPrivate('hex');
		return { publicKey, privateKey };
	}
}
