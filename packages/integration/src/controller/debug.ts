// import { Controller, ThreadContext } from '@sodacore/core';

// @Controller('example')
// export default class ThreadController {

// 	// This method as you can see by `example` namespace against the class
// 	// and then the method name `handle`.
// 	public async handle(context: ThreadContext) {

// 		// Let's get the context data.
// 		const data = context.getContext<{ url: string }>();

// 		// Let's create a page.
// 		const html = `
// 			<html>
// 				<head>
// 					<title>Sodacore Debug Example</title>
// 					<style>
// 						body { background-color: #19171E; }
// 						body * { color: #FFFFFF; font-family: sans-serif; }
// 					</style>
// 				</head>
// 				<body>
// 					<h1>Hello World!</h1>
// 					<p>Request URL: ${data.url}</p>
// 					<p>Generated at: ${new Date().toISOString()}</p>
// 				</body>
// 			</html>
// 		`;

// 		// Return the html.
// 		return { html };
// 	}
// }
