import { Inject } from '@sodacore/di';
import { OAuthProvider } from '@sodacore/discord';
import { Controller, Get, Query } from '@sodacore/http';

@Controller('/discord')
export default class DiscordController {
	@Inject() private oauth!: OAuthProvider;
	private state = '401d92b4-98d9-41df-a170-05ad17bb4659';
	private redirectPath = '/discord/accept';

	@Get('/authorise')
	public async run() {
		return this.oauth.doAuthorisation(this.redirectPath, this.state);
	}

	@Get('/accept')
	public async accept(@Query() query: URLSearchParams) {
		const result = await this.oauth.doAccept(query, this.redirectPath, this.state);
		if (!result) return 'Fail';

		const user = await this.oauth.getUser(result.accessToken);
		console.log(user);

		const result2 = await this.oauth.refreshToken(result.refreshToken);
		console.log(result2);

		return 'Success';
	}
}
