import { Controller, Get } from '@sodacore/http';
import { Layout, Page, Text } from '@sodacore/ui';

@Controller('/ui')
export default class PageController {

	@Get('/example')
	public async run() {
		const page = new Page('Basic Page')
			.setLayout(
				new Layout()
					.setAreas([
						['header', 'header'],
						['sidebar', 'content'],
						['footer', 'footer'],
					])
					.setColumns('1fr 3fr')
					.setRows('auto 1fr auto')
					.setGap('20px'),
			)
			.addElements(
				new Text()
					.setValue('Header')
					.setArea('header')
					.addClass('header')
					.addStyle('backgroundColor', 'blue')
					.addAttribute('data-uid', 'header'),
				new Text()
					.setValue('Sidebar')
					.setArea('sidebar')
					.addClass('sidebar')
					.addStyle('backgroundColor', 'green')
					.addAttribute('data-uid', 'sidebar'),
				new Text()
					.setValue('Content')
					.setArea('content')
					.addClass('content')
					.addStyle('backgroundColor', 'red')
					.addAttribute('data-uid', 'content'),
				new Text()
					.setValue('Footer')
					.setArea('footer')
					.addClass('footer')
					.addStyle('backgroundColor', 'yellow')
					.addAttribute('data-uid', 'footer'),
			)
			.toJSON();

		return new Response(JSON.stringify(page), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}
