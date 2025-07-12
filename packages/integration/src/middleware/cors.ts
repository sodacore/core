import { GlobalMiddleware, type HttpContext, type IGlobalMiddleware } from '@sodacore/http';

@GlobalMiddleware()
export default class CorsMiddleware implements IGlobalMiddleware {
	public async handle(context: HttpContext) {
		context.setResponseHeader('Access-Control-Allow-Origin', '*');
		context.setResponseHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		context.setResponseHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		context.setResponseHeader('Access-Control-Allow-Credentials', 'true');
	}
}
