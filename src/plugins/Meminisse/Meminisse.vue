<template>
	<div id="rootdiv">
		<div id="maindiv">
			<h1>
				Meminisse
			</h1>
			<p>
				This plugin will log all the movement of the machine to grasp the wear of the components.
			</p>
			<div id="btndiv">
				<v-btn @click="onClick" :elevation="this.elevation">{{this.active}}</v-btn>
			</div>
			<p>
				{{this.state}}
			</p>
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
			default: false
		}
	},

	methods: {
		onClick() {
			this.active = !this.active;
			console.log("The button was pressed and the debug mode is %s", this.debug);
		}
	}
}

</script>
