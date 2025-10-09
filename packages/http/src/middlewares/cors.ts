import type { IGlobalMiddleware } from '../types';
import { GlobalMiddleware } from '../decorator/middleware';
import HttpContext from '../context/http';

@GlobalMiddleware()
export default class CorsMiddleware implements IGlobalMiddleware {
	public async supports() {
		return true;
	}

	public async handle(context: HttpContext) {
		context.setResponseHeader('Access-Control-Allow-Origin', '*');
		context.setResponseHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		context.setResponseHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		context.setResponseHeader('Access-Control-Allow-Credentials', 'true');
	}
}
