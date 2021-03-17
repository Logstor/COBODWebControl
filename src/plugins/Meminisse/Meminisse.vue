<style scoped>

h1 {
	font-size: xx-large;
}

#rootdiv {
	display: flex;
	flex-direction: column;
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

#bottomdiv {
	display: flex;
	flex-direction: row;
	justify-content: center;

	border: 2px solid red;
}

#downloadplate {
	display: flex;
	justify-content: center;
	flex-direction: column;

	box-shadow: 5px 5px 5px darkblue;
	border-radius: 10px;

	background: cornsilk;
}

#downloadheader {
	display: flex;
	justify-content: center;
	margin: 10px;
}

#downloadtable, td {
	padding: 5px;
}

</style>

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
			
		</div>
		
		<div id="bottomdiv">
			<div id="downloadplate">
				<div id="downloadheader">
					<h2>Downloadable logs</h2>
				</div>
				<div id="downloadlist">
					<table id="downloadtable">
						<tr>
							<th>Date</th>
							<th>Link</th>
						</tr>
						<tr v-for="(log, index) in logList" :key="index">
							<td>{{ log.date() }}</td>
							<td><a :href="log.createBlob()" :download="log.date()+'.csv'">Download</a></td>
						</tr>
					</table>
				</div>

			</div>
				
		</div>
	</div>
</template>

<script>
'use strict'

import { mapState } from 'vuex';
import { isPrinting } from '../../store/machine/modelEnums.js';
import { Log } from './log'

export default {
	data() {
		return {
			elevation: "2",
			active: true,

			logList: [new Log(Date.now, ["Mock", "Mocky"]), 
			new Log(Date.now, ["Mock", "Mocky"]), 
			new Log(Date.now, ["Mock", "Mocky"])],
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

		visibleAxis() {
			return this.move.axes.filter(axis => axis.visible);
		},

		async log() {
			// Make log header depending on axis.
			let axis = this.visibleAxis();
			let headers = new Array(axis.length);
			for (let a in axis)
				headers.push(a.letter);
			let currLog = new Log(Date.now, headers);

			//TODO: Continously add to log
			while (this.active && this.isJobRunning)
			{
				console.log("We're logging now!");
				await new Promise(r => setTimeout(r, 2000));
				currLog.addEntry([100, 100, 100]);
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
