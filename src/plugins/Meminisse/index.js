'use strict'

import { registerRoute, registerCategory } from '../../routes'

import Meminisse from './Meminisse.vue'

// Register new category and add to that route
registerCategory("COBOD", null, "COBOD International A/S", true);

registerRoute(Meminisse, {
	COBOD: {
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
