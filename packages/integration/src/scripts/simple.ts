import { type AsScript, Namespace, Script, ScriptContext } from '@sodacore/core';

@Namespace('example')
export default class ExampleScript implements AsScript<ExampleScript> {

	@Script('foo')
	public async foo(context: ScriptContext) {

		// Check text.
		const name = await context.prompts.text({
			message: 'What is your name?',
		});
		context.log.info(`Name: ${name}`);

		// Check confirm.
		const confirmed = await context.prompts.confirm({
			message: 'Are you sure?',
		});
		context.log.info(`Confirmed: ${confirmed}`);

		// Check select.
		const colour = await context.prompts.select({
			message: 'What is your favourite colour?',
			options: [
				{ value: 'red', label: 'Red' },
				{ value: 'green', label: 'Green' },
				{ value: 'blue', label: 'Blue' },
			],
		});
		context.log.info(`Colour: ${colour}`);

		// Check multi-select.
		const hobbies = await context.prompts.multiselect({
			message: 'What are your hobbies?',
			options: [
				{ value: 'reading', label: 'Reading' },
				{ value: 'gaming', label: 'Gaming' },
				{ value: 'sports', label: 'Sports' },
				{ value: 'music', label: 'Music' },
			],
		});
		context.log.info(`Hobbies: ${hobbies}`);

		// Check group.
		const group = context.prompts.createGroup();
		const result = await group
			.addText('name', { message: 'What is your name?' })
			.addSelect('colour', { message: 'What is your favourite colour?', options: [
				{ value: 'red', label: 'Red' },
				{ value: 'green', label: 'Green' },
				{ value: 'blue', label: 'Blue' },
			] })
			.addConfirm('confirmed', { message: 'Are you sure?' })
			.addMultiselect('hobbies', { message: 'What are your hobbies?', options: [
				{ value: 'reading', label: 'Reading' },
				{ value: 'gaming', label: 'Gaming' },
				{ value: 'sports', label: 'Sports' },
				{ value: 'music', label: 'Music' },
			] })
			.send<{ name: string, colour: string, confirmed: boolean, hobbies: string[] }>();

		// Wait for the group.
		if (!result) {
			context.log.error('No result provided.');
			return 'Failed';
		}

		// Notify the outcome.
		context.log.info(`Results:\n\nName: ${result.name}\nColour: ${result.colour}\nConfirmed: ${result.confirmed}\nHobbies: ${(result.hobbies ?? []).join(', ')}`);

		// Return the result.
		return 'Done!';
	}
}
