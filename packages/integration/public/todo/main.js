import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
	setup() {
		const taskTitle = ref('');
		const taskDescription = ref('');
		const tasks = ref([]);

		const createTask = async () => {
			const response = await fetch('/api/todo', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: taskTitle.value,
					description: taskDescription.value,
				}),
			});
			if (response.ok) {
				taskTitle.value = '';
				taskDescription.value = '';
				await refreshTasks();
			} else {
				console.error('Failed to create task');
			}
		};

		const refreshTasks = async () => {
			const response = await fetch('/api/todo');
			if (response.ok) {
				tasks.value = await response.json();
			}
		};

		const toggleTask = async (task) => {
			const response = await fetch(`/api/todo/${task.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ completed: !task.completed }),
			});
			if (response.ok) {
				await refreshTasks();
			}
		}

		const deleteTask = async (task) => {
			const response = await fetch(`/api/todo/${task.id}`, {
				method: 'DELETE',
			});
			if (response.ok) {
				await refreshTasks();
			}
		};

		return {
			tasks,
			taskTitle,
			taskDescription,
			createTask,
			toggleTask,
			deleteTask,
			refreshTasks,
		};
	},
	created: function() {
		this.refreshTasks();
	},
}).mount('#app');
