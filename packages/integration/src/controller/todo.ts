import { Controller, Get, Params } from '@sodacore/http';
import { resolve } from 'node:path';
import { file } from 'bun';
import process from 'node:process';

@Controller('/todo')
export default class TodoController {
	private readonly basePath = resolve(process.cwd(), './public/todo');

	@Get('/')
	public async index() {
		const indexPath = resolve(this.basePath, 'index.html');
		return new Response(file(indexPath));
	}

	@Get('/:asset')
	public async get(@Params('asset') asset: string) {
		const assetPath = resolve(this.basePath, asset.replaceAll('..', ''));
		if (!assetPath.startsWith(this.basePath)) {
			return new Response('Forbidden', { status: 403 });
		}
		return new Response(file(assetPath));
	}
}
