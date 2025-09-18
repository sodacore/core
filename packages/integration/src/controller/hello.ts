import { Controller, Get } from '@sodacore/http';

@Controller('/hello')
export default class HelloController {

	@Get('/test1')
	public async test1() {
		return 'test1';
	}

	@Get('/test2/?:id')
	public async test2() {
		return 'test2';
	}

	@Get('/test3/?:id/?:name')
	public async test3() {
		return 'test3';
	}

	@Get('/test4/:id/name/?:name')
	public async test4() {
		return 'test4';
	}

	@Get('/test5/*')
	public async test5() {
		return 'test5';
	}
}
