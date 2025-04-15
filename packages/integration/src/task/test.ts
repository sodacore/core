import { BaseTask, Task } from '@sodacore/core';

@Task(undefined, { name: 'Test 1' })
export default class TestTask extends BaseTask {

	public async run() {
		console.log('Test task ran!');
	}
}
