import { environment as devEnvironment } from './environment';
import { environment as prodEnvironment } from './environment.prod';

export const environment = import.meta.env.PROD ? prodEnvironment : devEnvironment;
