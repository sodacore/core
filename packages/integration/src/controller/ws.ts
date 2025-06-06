import { Expose, WsConnections, WsContext, Controller as WsController } from '@sodacore/ws';
import { Get, Controller as HttpController } from '@sodacore/http';
import { Inject } from '@sodacore/di';

@WsController('test')
@HttpController('/ws-test')
export default class TestWsController {
	@Inject() private connections!: WsConnections;

	@Expose()
	public async ping(context: WsContext) {
		const data = context.getData<{ broadcast?: boolean }>();
		if (!data.broadcast) return 'pong!';
		this.connections.broadcast('test:ping');
	}

	@Get()
	public async root() {
		return new Response(/* html */`
			<html>
				<head>
					<title>WebSocket Test</title>
				</head>

				<body>
					<h1>WebSocket Test</h1>
					<p>This is a test page for the WebSocket integration. Messages are shown below.</p>
					<button id="sendMessage">Send Ping</button>
					<button id="broadcastMessage">Broadcast Ping</button>
					<ul id="messages"></ul>

					<script>
						const ws = new WebSocket('ws://localhost:3101/ws');
						const ul = document.getElementById('messages');
						const sendMessageButton = document.getElementById('sendMessage');
						const broadcastMessageButton = document.getElementById('broadcastMessage');

						sendMessageButton.addEventListener('click', () => {
							ws.send(JSON.stringify({
								command: 'test:ping',
							}));
						});

						broadcastMessageButton.addEventListener('click', () => {
							ws.send(JSON.stringify({
								command: 'test:ping',
								data: { broadcast: true },
							}));
						});

						ws.onmessage = (event) => {
							const li = document.createElement('li');
							li.textContent = event.data;
							ul.appendChild(li);
						};

						ws.onopen = () => console.log('WebSocket connection established.');
						ws.onclose = () => console.log('WebSocket connection closed.');
					</script>
			</html>
		`, {
			headers: {
				'Content-Type': 'text/html',
			},
		});
	}
}
