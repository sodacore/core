import Icon from './components/icon/icon';
import { IconVariant } from './components/icon/types';

const icon = new Icon('icon-test')
	.setName('home')
	.setLabel('Home Icon')
	.setLibrary('default')
	.setVariant(IconVariant.Regular)
	.setAutoWidth()
	.setSwapOpacity(false);

console.log('JSON', icon.toJSON());
console.log('HTML', icon.toHTML());
