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
							<th>GCode</th>
							<th>Date</th>
							<th>Link</th>
						</tr>
						<tr v-for="(log, index) in logList" :key="index">
							<td>{{ log.filename }}</td>
							<td>{{ log.date }}</td>
							<td><a :href="log.createBlob()" :download="log.date+'.csv'">Download</a></td>
						</tr>
					</table>
				</div>

			</div>
				
		</div>
	</div>
</template>

<script>
'use strict'

//import { Log } from './log';
//import { sleep } from './index.js';
import PollConnector from '../../store/machine/connector/PollConnector.js'

export default {
	data() {
		return {
			elevation: "2",
			logList: [],
		}
	},

	/**
	 * Private properties
	 */
	created: {
		
	},
	
	computed: {
		
	},

	asyncComputed: {
		async fileList() {
			
		}
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
			this.printd("Button clicked");
		},

		async getFileList() {
			this.printd("Trying to connect and get file list")
			let connection = PollConnector.connect();
			let folders = await connection.getFileList("0:/Meminisse/data/2021");
			this.printd("Done getting filelist")

			this.printd(folders);

			return folders;
		},
	},

	/**
	 * This function is fired, when the component is loaded. It only runs when the plugin gets started.
	 */
	mounted: function() {
		this.printd("Meminisse is mounted!");
		this.printd(this.getFileList());
	}
}

</script>
