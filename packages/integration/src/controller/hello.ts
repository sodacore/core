import { Controller, Cookies, Get, Params, Query } from '@sodacore/http';

@Controller('/hello')
export default class HelloController {

	@Get('/test1')
	public async test1(
		@Cookies('hello') cookies: Map<string, string>,
		@Query('name') name?: string,
	) {
		console.log(cookies, name);
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
	public async test4(
		@Params('id') id: string,
		@Params('name') name?: string,
	) {
		return `test4 ${id} ${name || 'no'}`;
	}

	@Get('/test5/*')
	public async test5() {
		return 'test5';
	}
}
