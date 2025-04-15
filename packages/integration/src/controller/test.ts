import { Controller, Get } from '@sodacore/http';

@Controller('/test')
export default class ChainController {

	@Get('/:hello/:something?/:else?')
	public async run() {
		return new Response('Hello World!');
	}
}
