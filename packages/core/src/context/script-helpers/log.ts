export default class LogScriptHelper {
	public constructor(
		private send: (command: string, context?: Record<string, any>) => void,
	) {}

	public info(message: string) {
		this.send('_:log', { type: 'info', message });
	}

	public error(message: string) {
		this.send('_:log', { type: 'error', message });
	}

	public success(message: string) {
		this.send('_:log', { type: 'success', message });
	}

	public message(message: string) {
		this.send('_:log', { type: 'message', message });
	}

	public step(message: string) {
		this.send('_:log', { type: 'step', message });
	}

	public warning(message: string) {
		this.send('_:log', { type: 'warning', message });
	}

	public warn(message: string) {
		this.send('_:log', { type: 'warn', message });
	}
}
