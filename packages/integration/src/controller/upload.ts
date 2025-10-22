import { Body, Controller, Files, Get, Post } from '@sodacore/http';
import { file } from 'bun';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

@Controller('/upload')
export default class UploadController {

	@Get('/')
	public async index() {
		const uploadHtml = file(resolve(cwd(), './src/views/upload.html'));
		if (!uploadHtml) return null;
		return new Response(uploadHtml);
	}

	@Post('/accept')
	public async accept(
		@Files() files: Record<string, File>,
		@Files('file1') file1: File,
		@Files('file2') file2: File,
		@Body('json') body: string,
	) {
		console.log('Body:', body);
		console.log(`File1: filename: ${file1.name}, size: ${file1.size}`);
		console.log(`File2: filename: ${file2.name}, size: ${file2.size}`);
		console.log('Files:', files);

		return 'Files received successfully.';
	}

	@Get('/obvs-shouldnt-be-here')
	public async noUpload(
		@Files() files?: Record<string, File>,
		@Files('meh') aFile?: File,
	) {
		console.log(files, aFile);
		return 'No upload here.';
	}
}
