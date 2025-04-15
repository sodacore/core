import type { AsScript, IConfig } from '../types';
import { Inject } from '@sodacore/di';
import Namespace from '../decorator/namespace';
import Script from '../decorator/script';
import Scripts from '../module/scripts';
import type ScriptContext from '../context/script';

@Namespace('_')
export default class DefaultScripts implements AsScript<DefaultScripts> {
	@Inject('config') private config!: IConfig;
	@Inject() private scripts!: Scripts;

	@Script('authenticate')
	public async authenticate(context: ScriptContext) {
		const password = context.getContext<string>('password');
		const socket = context.getSocket();
		const doesPasswordMatch = this.config.password === password;
		socket.data.authenticated = doesPasswordMatch;
		context.send('_:authenticate', { status: doesPasswordMatch });
		if (!doesPasswordMatch) setTimeout(() => socket.terminate(), 3e3);
	}

	@Script('commands')
	public async commands(context: ScriptContext) {
		const commands = this.scripts.getCommands().filter(key => !key.startsWith('_:'));
		context.send('_:commands', { commands });
	}

	@Script('interact')
	public async interact(context: ScriptContext) {
		const socket = context.getSocket();
		const uid = context.getContext<string>('uid');
		const results = context.getContext<Record<string, any>>('results');
		if (!socket.data.results[uid]) return;
		socket.data.results[uid](results);
		delete socket.data.results[uid];
	}
}
