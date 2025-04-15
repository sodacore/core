// import { CurrencyBlock, CurrencyBlockchain, KeyGenerator } from '@sodacore/blockchain';
// import { Controller, Get } from '@sodacore/http';

// @Controller('/chain')
// export default class ChainController {

// 	@Get('/')
// 	public async run() {

// 		// Define my keys.
// 		const privateKey = '4699fb54834e72b8dfa0efd6c11be043ce77ccce14383b97893f45e1880f781c';

// 		// Create our keypair.
// 		const keyGenerator = new KeyGenerator();
// 		const instance = keyGenerator.getInstance();
// 		const myKey = instance.keyFromPrivate(privateKey);
// 		const myWalletAddress = myKey.getPublic('hex');

// 		const currency = new CurrencyBlockchain(keyGenerator);

// 		// /*
// 		// 	We need to create a keygen pair first.
// 		// 	Then utilise that same pair for everything going forward.

// 		// 	At the moment, we are generating two different ones, which is breaking the chain.
// 		// */

// 		// // Create our new currency.
// 		// const currency = new CurrencyBlockchain(keyGenerator);

// 		// // Mine first block
// 		// currency.minePendingTransactions(myWalletAddress);

// 		// // Create a transaction & sign it with your key
// 		// const tx1 = new CurrencyTransaction(keyGenerator, myWalletAddress, 'address2', 100);
// 		// tx1.sign(myKey);
// 		// currency.addTransaction(tx1);

// 		// // Mine block
// 		// currency.minePendingTransactions(myWalletAddress);

// 		// // Create second transaction
// 		// const tx2 = new CurrencyTransaction(keyGenerator, myWalletAddress, 'address1', 50);
// 		// tx2.sign(myKey);
// 		// currency.addTransaction(tx2);

// 		// // Mine block
// 		// currency.minePendingTransactions(myWalletAddress);

// 		// // Uncomment this line if you want to test tampering with the chain
// 		// // currency.chain[1].transactions[0].amount = 10;
// 		// console.log(
// 		// 	`My balance is ${currency.getBalanceOfAddress(myWalletAddress)}`,
// 		// 	`\nBlockchain valid? ${currency.isChainValid() ? 'Yes' : 'No'}`,
// 		// );

// 		// return {
// 		// 	chain: currency.chain,
// 		// 	balance: currency.getBalanceOfAddress(myWalletAddress),
// 		// 	isChainValid: currency.isChainValid(),
// 		// };
// 	}
// }
