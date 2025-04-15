import { ec as EllipticCurve } from 'elliptic';

// You can use any elliptic curve you want
const ec = new EllipticCurve('secp256k1');

// Generate a new key pair and convert them to hex-strings
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// Print the keys to the console
console.log(
	'\nYour public key (also your wallet address, freely shareable)\n',
	publicKey,
	'\nYour private key (keep this secret! To sign transactions)\n',
	privateKey,
);
