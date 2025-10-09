import type { IConfigConnectionItem, ISocketData } from './types';
import { connect, type Socket } from 'bun';
import { log } from '@clack/prompts';
import Commands from './commands';

export default class Application {
	private exitHandler!: (value?: string) => void;
	private socket!: Socket<ISocketData>;
	private commands!: Commands;
	private answers: string[] = [];
	private closeAfter = false;

	public constructor(private connection: IConfigConnectionItem, answers?: string[]) {
		if (answers) {
			this.answers = answers;
			this.closeAfter = true;
		};
	}

	public init() {
		return new Promise<string | undefined>(resolve => {
			this.exitHandler = (value?: string) => {
				if (this.socket) this.socket.end();
				resolve(value);
			};
			this.commands = new Commands(this.exitHandler.bind(this), this.answers, this.closeAfter);
			this.connect();
		});
	}

	private async connect() {
		this.socket = await connect<ISocketData>({
			hostname: this.connection.host,
			port: this.connection.port,
			socket: {
				end: () => this.exitHandler('Connected was closed.'),
				timeout: () => this.exitHandler('Connection timed out.'),
				connectError: (_: unknown, err) => this.exitHandler(`Connection error: ${err.message}`),
				error: (_: unknown, err) => this.exitHandler(`Socket error: ${err.message}, connection closed.`),
				close: (_: unknown, err?: Error) => this.exitHandler(`Socket disconnected${err ? `: reason: ${err.message}` : ''}`),
				open: socket => this.onOpen.bind(this)(socket),
				data: (_, data) => this.handle.bind(this)(data.toString()),
			},
		});
	}

	private async onOpen(socket: Socket<ISocketData>) {
		this.commands.setSocket(socket);
		socket.data = { uid: Bun.randomUUIDv7(), authenticated: false };
		this.write(socket, '_:authenticate', { password: this.connection.pass });
		log.success(`Connection established to ${this.connection.host}:${this.connection.port}`);
	}

	private async handle(data: string) {
		try {
			const packet = JSON.parse(data);
			const { command, context } = packet;

			if (this.closeAfter && command === '_:error') {
				log.error(`Error: ${context.message}`);
				this.exitHandler();
				return;
			}

			const status = this.commands.handle(command, context);
			if (!status) log.error(`Command ${command} not found.`);
		} catch (err) {
			console.error(err);
			log.error(`Error processing response data: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	private write(socket: Socket<ISocketData>, command: string, context: Record<string, any> = {}) {
		socket.write(JSON.stringify({ _uid: socket.data.uid, command, context }));
	}
}
