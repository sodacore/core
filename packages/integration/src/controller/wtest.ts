import { Controller, Get, Headers } from '@sodacore/http';
import { Expose, Utils, Worker } from '@sodacore/core';

@Controller('/wtest')
@Worker(Utils.resolve(import.meta.filename), {
	poolSize: 5,
})
export default class WTestController {

	@Expose()
	@Get('/say')
	public async say(
		@Headers('user-agent') userAgent: string,
	) {
		return userAgent;
	}
}
