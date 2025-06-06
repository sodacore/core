import type { IConfig } from './types';
import WsContext from './context/ws';
import Controller from './decorators/controller';
import Expose from './decorators/expose';
import Middleware from './decorators/middleware';
import UpgradeMiddleware from './middleware/upgrade';
import WsPlugin from './module/plugin';
import WsConnections from './provider/ws-connections';

import WsService from './service/ws';

export default WsPlugin;

export {
	Controller,
	Expose,
	Middleware,
	UpgradeMiddleware,
	WsConnections,
	WsContext,
	WsService,
};

export type {
	IConfig,
};
