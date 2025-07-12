import HttpContext from '../context/http';

export default function CorsMiddleware(context: HttpContext) {
	context.setResponseHeader('Access-Control-Allow-Origin', '*');
	context.setResponseHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	context.setResponseHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	context.setResponseHeader('Access-Control-Allow-Credentials', 'true');
};
