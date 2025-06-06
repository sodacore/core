import { Inject, Provide } from '@sodacore/di';
import Workers from '../module/workers';

@Provide()
export default class WorkersProvider {
	@Inject() private workers!: Workers;

	public async dispatch(uid: string, method: string, params: unknown[] = []) {
		return await this.workers.dispatch(uid, method, params);
	}

	public getWorkers(uid: string) {
		const controller = this.workers.getController(uid);
		if (!controller) return [];
		return controller.workers;
	}

	public getQueueSizePerController() {
		const controllers = this.workers.getControllers();
		const queueSizes: Record<string, number> = {};
		for (const [uid, controller] of Object.entries(controllers)) {
			queueSizes[uid] = controller.queue.length;
		}
		return queueSizes;
	}

	public getTotalQueueSize() {
		const controllers = this.workers.getControllers();
		return Object.values(controllers).reduce((total, controller) => {
			return total + controller.queue.length;
		}, 0);
	}
}
