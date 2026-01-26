import { route as ziggyRoute } from 'ziggy-js';

declare const Ziggy: any;

export const route = (name: string, params: any = {}, absolute: boolean = true) =>
    ziggyRoute(name, params, absolute, Ziggy);
