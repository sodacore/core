// @ts-nocheck - Demo code only, no type checking.
import { Flow, Step } from '@sodacore/flow';

const flow = new Flow({
	timeout: 6e4,
});

flow.addStep(new Step({
	name: 'step1',
}));
