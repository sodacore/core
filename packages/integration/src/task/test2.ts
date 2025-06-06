import { BaseTask, Task } from '@sodacore/core';

@Task(undefined)
export default class Test2Task extends BaseTask {

	public async run() {
		console.log('Test task2 ran!');
	}
}
