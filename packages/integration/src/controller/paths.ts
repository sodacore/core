import { Controller, Get, Params } from '@sodacore/http';

@Controller('/paths')
export default class PathsController {
	// Static
	@Get('/home')
	public home() { return 'home'; }

	// Deep nesting
	@Get('/users/:userId/posts/:postId/comments')
	public nested(
		@Params('userId') userId: string,
		@Params('postId') postId: string,
	) {
		return `nested ${userId} ${postId}`;
	}

	// Basic :param
	@Get('/products/:productId')
	public product(
		@Params('productId') productId: string,
	) {
		return `product ${productId}`;
	}

	// Optional param in the middle
	@Get('/profile/:username?')
	public profile(
		@Params('username') username?: string,
	) {
		return `profile ${username ?? ''}`;
	}

	// Single-segment wildcard
	@Get('/files/*/details')
	public oneWild() { return 'oneWild'; }

	// Multi-segment wildcard (tail-only)
	@Get('/assets/**')
	public assets() { return 'assets'; }

	// Glob param (only .png)
	@Get('/images/:imageName(*.{png,svg})')
	public images(
		@Params('imageName') imageName: string,
	) { return `images ${imageName}`; }

	// Mixed features: param + '*' + optional
	@Get('/lib/:pkg/*/:file?')
	public lib(
		@Params('pkg') pkg: string,
		@Params('file') file?: string,
	) { return `lib ${pkg} ${file ?? ''}`; }
}
