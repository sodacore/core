import type { ITaskSettings } from '../types';
import { Utils } from '@sodacore/di';

/**
 * Apply this to a decorator that extends the BaseTask class,
 * to turn the class into a scheduled cron job that will run
 * based on the schedule with the given settings, we use the
 * [Croner](https://github.com/hexagon/croner) library for this.
 * @param schedule Cron pattern. [Explained](https://github.com/hexagon/croner?tab=readme-ov-file#pattern)
 * @param settings Optional settings. [Explained](https://github.com/hexagon/croner?tab=readme-ov-file#options)
 * @returns ClassDecorator
 * @default
 */
export default function Task(schedule?: string, settings?: ITaskSettings) {
	return (target: any) => {
		Utils.setMeta('type', 'autowire')(target, 'task');
		Utils.setMeta('schedule', 'task')(target, schedule ?? 'manual');
		Utils.setMeta('settings', 'task')(target, settings || {});
	};
}
