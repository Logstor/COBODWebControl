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
							<th>GCode</th>
							<th>Date</th>
							<th>Link</th>
						</tr>
						<tr v-for="(log, index) in logList" :key="index">
							<td>{{ log.filename() }}</td>
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
import { isPrinting, isPaused } from '../../store/machine/modelEnums.js';
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

	/**
	 * Private properties
	 */
	created: {
		localStorageLogName: "currentLog"
	},
	
	computed: {
		...mapState('machine/model', ['job', 'move', 'state']),
		isJobRunning: state => isPrinting(state.state.status),
		isJobPaused: state => isPaused(state.state.status),
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
		printd(text) {
			if (this.debug) console.log(text);
		},

		onClick() {
			this.active = !this.active;
			this.printd("Button clicked");
		},

		/**
		 * Returns an array of visible axis as classes.
		 */
		visibleAxis() { return this.move.axes.filter(axis => axis.visible); },

		/**
		 * Adds a downloadable log to the list over downloadable logs.
		 * 
		 * @param {Log} log The class instance of Log to add.
		 */
		addLog(log) {
			this.printd("addLog()");
			this.logList.push(log);
		},

		/**
		 * Saves an instance of the log to localstorage for later use.
		 * 
		 * @param {Log} log The class instance of Log to save.
		 */
		addLogLocalStorage(log) {
			localStorage.setItem(this.localStorageLogName, JSON.stringify(log));
		},

		clearLogLocalStorage() {
			localStorage.removeItem(this.localStorageLogName);
		},

		retrieveLogFromLocalStorage() {
			// Try to retrieve the old log
			let log = JSON.parse(localStorage.getItem(this.localStorageLogName));

			// Check there was any
			if (log == null)
			{
				if (this.debug)
					this.printd("There wasn't any old log in the localstorage");
				return null;
			}

			// Make sure it's parsed correctly
			if (typeof log != 'object')
				throw "Retrieved log isn't of type Class Log!";

			return log;
		},

		async log() {
			this.printd("async log()");

			// Wait for print to start
			this.printd("Waiting for job starting");
			while(!this.isJobRunning) await sleep(1000);

			let axis; let currLog;
			let oldLog = this.retrieveLogFromLocalStorage();
			if (oldLog == null) 
			{
				this.printd("Didn't find old log");
				this.printd("Starting print log with filename {0}".format(this.job.file.fileName));

				// Make log header depending on axis.
				axis = this.visibleAxis();
				let headers = new Array();
				for (let i=0; i < axis.length; ++i)
					headers.push(axis[i].letter);
				currLog = new Log(this.job.file.fileName, Date.now, headers);
			}
			else
			{
				this.printd("Found old log with filename {0}".format(this.job.file.fileName));
				axis.visibleAxis();
				currLog = oldLog;
			}

			// Make sure we don't lose the current log on refresh
			window.onbeforeunload = function() {
				this.addLogLocalStorage(currLog);
			};

			// Continously add to log
			this.printd("Going into log loop");
			while (this.active && this.isJobRunning)
			{
				// Delay
				await sleep(this.logDelay);

				// Make sure the print isn't paused
				if (this.isJobPaused)
					continue;
				
				// Record every position and add to log
				let positions = new Array();
				for (let i=0; i < axis.length; ++i)
				{
					let pos = axis[i].machinePosition;
					positions.push( (pos != null) ? pos : -1 );
				}
				currLog.addEntry(positions);
			}
			this.printd("Out of log loop");

			// Done with current print, then make log available for download
			this.addLog(currLog);
			this.clearLogLocalStorage();
			window.onbeforeunload = null;

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
			this.printd("Meminisse is mounted!");

		// Start the asynchronious logging
		this.log();
	}
}

</script>
