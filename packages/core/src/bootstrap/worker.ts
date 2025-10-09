import { getWorkerFileFromArgs } from '../helper/utils';
import WorkerWrapper from '../module/worker';

new WorkerWrapper(getWorkerFileFromArgs());
