import type { IConfig } from './types';
import WsContext from './context/ws';
import Controller from './decorators/controller';
import Expose from './decorators/expose';
import Transform from './decorators/transform';
import UpgradeMiddleware from './middleware/upgrade';
import WsPlugin from './module/plugin';
import WsConnections from './provider/ws-connections';

import WsService from './service/ws';

export default WsPlugin;

export {
	Controller,
	Expose,
	Transform,
	UpgradeMiddleware,
	WsConnections,
	WsContext,
	WsService,
};

export type {
	IConfig,
};
