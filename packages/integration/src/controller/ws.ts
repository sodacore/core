import { Controller, Expose } from '@sodacore/ws';

@Controller('test')
export default class WSTestController {

	@Expose()
	public async hello() {
		return 'Hello World!';
	}
}
