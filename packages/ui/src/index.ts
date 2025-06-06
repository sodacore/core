import type { IConfig } from './types';
import UiPlugin from './module/plugin';
import BaseElement from './elements/base';
import Input from './elements/input';
import Layout from './elements/layout';
import Page from './elements/page';
import Text from './elements/text';

export default UiPlugin;

export {
	BaseElement,
	Input,
	Layout,
	Page,
	Text,
};

export type {
	IConfig,
};
