import { intro, outro } from '@clack/prompts';
import { inverse } from 'picocolors';
import { main } from './menu';
import { exec } from './exec';
import { argv } from 'bun';

const args = argv.slice(2);

console.log('');
intro(inverse(' Create Sodacore '));
if (args[0] === 'exec') {
	await exec(args.slice(1));
} else {
	await main();
}
outro('Thanks for using Sodacore!');
