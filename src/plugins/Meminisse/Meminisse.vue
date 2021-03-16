<template>
	<div id="rootdiv">
		<div id="maindiv">
			<h1>
				Meminisse
			</h1>
			<p>
				This plugin will log all the movement of the machine to grasp the wear of the components.<br>
				Logging is currently {{this.loggingState}}.
			</p>
			<div id="btndiv">
				<v-btn @click="onClick" :elevation="this.elevation">{{this.active}}</v-btn>
			</div>
			<p>
				{{ this.state }}
			</p>
			<div id="downloaddiv">
				<!-- TODO: Make list of downloadable logs -->
				
				<h2>Downloadable logs</h2>
				
				
			</div>
		</div>
		
	</div>
</template>

<style scoped>

h1 {
	font-size: xx-large;
}

#rootdiv {
	display: flex;
	justify-content: center;

	border: 2px solid green;
}

#maindiv {
	display: table;
	align-items: center;
	text-align: center;

	border: 2px solid yellow;
}

#btndiv {
	display: flex;
	justify-content: center;
	align-items: center;

	border: 2px solid red;
}

#downloaddiv {

}

</style>

<script>
'use strict'

import { mapState } from 'vuex';
import { isPrinting } from '../../store/machine/modelEnums.js';

export default {
	data() {
		return {
			elevation: "2",
			active: true,
		}
	},
	
	computed: {
		...mapState('machine/model', ['job', 'move', 'state']),
		isJobRunning: state => isPrinting(state.state.status),
		loggingState() {
			return this.active ? "On" : "Off";
		},
	},

	props: {
		debug: {
			required: false,
			type: Boolean,
			default: true
		}
	},

	methods: {
		onClick() {
			this.active = !this.active;
			console.log("The button was pressed and the debug mode is %s", this.debug);
		},

		async log() {
			//TODO: Make new log here and add to it while printing
			while (this.active && this.isJobRunning)
			{
				console.log("We're logging now!");
				await new Promise(r => setTimeout(r, 2000));
			}

			//TODO: Done with current print, then make log available for download

			//TODO: Prepare for logging again
		}
	},

	/**
	 * This function is fired, when the component is loaded. It only runs when the plugin gets started.
	 */
	mounted: function() {
		if (this.debug)
			console.log("Meminisse is mounted!");

		// Start the asynchronious logging
		this.log();
	}
}

</script>
