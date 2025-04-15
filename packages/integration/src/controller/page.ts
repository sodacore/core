// import { Controller, Get, Params } from '@sodacore/http';

// @Controller('/')
// export default class PageController {

// 	@Get('/')
// 	public async run() {
// 		return new Response(`
// <!DOCTYPE html>
// <html>
// 	<head>
// 		<title>Page</title>
// 	</head>
// 	<body>
// 		<h1>Page</h1>
// 		<script type="module" crossorigin src="/assets/index-8s789aSCBHASF.js"></script>
// 	</body>
// </html>
// 		`, {
// 			headers: {
// 				'Content-Type': 'text/html',
// 			},
// 		});
// 	}

// 	@Get('/assets/:name')
// 	public async asset(
// 		@Params('name') name: string,
// 	) {
// 		return new Response(`
// console.log('Hello, World!', '${name}');
// 		`, {
// 			headers: {
// 				'Content-Type': 'application/javascript',
// 			},
// 		});
// 	}
// }
