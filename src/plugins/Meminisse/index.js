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
