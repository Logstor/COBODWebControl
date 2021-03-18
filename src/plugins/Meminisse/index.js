'use strict'

import { registerRoute } from '../../routes'

import Meminisse from './Meminisse.vue'

// Register a route via Control -> Meminisse
registerRoute(Meminisse, {
	Control: {
		Meminisse: {
			icon: 'mdi-file-tree',
			caption: 'Meminisse',
			path: '/Meminisse'
		}
	}
});

/**
 * Used for thread sleeping, and returns a Promise which can be waited for.
 */
export function sleep(msec)
{
	return new Promise(resolve => setTimeout(resolve, msec));
}
