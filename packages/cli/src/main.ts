import { intro, outro } from '@clack/prompts';
import { inverse } from 'picocolors';
import { main } from './menu';

console.log('');
intro(inverse(' Create Sodacore '));
await main();
outro('Thanks for using Sodacore!');
