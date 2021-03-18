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

	box-shadow: 5px 5px 8px darkblue;
	border-radius: 10px;

	background: cornsilk;
}

#downloadheader {
	display: flex;
	justify-content: center;
	margin: 10px;
}

#downloadtable, td, th {
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

//import { mapState } from 'vuex';
import { isPrinting } from '../../store/machine/modelEnums.js';
import { Log } from './log';
import { sleep } from './index.js';

export default {
	data() {
		return {
			elevation: "2",
			active: true,

			logDelay: 2000,

			logList: new Array(),
		}
	},
	
	computed: {
		//...mapState('machine/model', ['job', 'move', 'state']),
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
			/*return this.move.axes.filter(axis => axis.visible); */
			return [{letter: "X"}, {letter: "Y"}];
		},

		addLog(log) {
			this.logList.push(log);
		},

		async log() {
			// Wait for print to start
			//while(!this.isJobRunning) await sleep(1000);

			// Make log header depending on axis.
			let axis = this.visibleAxis();
			let headers = new Array();
			for (let i=0; i < axis.length; ++i)
				headers.push(axis[i].letter);
			let currLog = new Log(Date.now, headers);

			// Continously add to log
			while (this.active /*&& this.isJobRunning*/)
			{
				await sleep(this.logDelay);
				currLog.addEntry([100, 100]);
			}

			// Done with current print, then make log available for download
			this.addLog(currLog);

			// Prepare for logging again
			if (this.active)
				this.log();
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
