import { getThreadFileFromArgs } from '../helper/utils';
import WorkerWrapper from '../module/worker';

new WorkerWrapper(getThreadFileFromArgs());
