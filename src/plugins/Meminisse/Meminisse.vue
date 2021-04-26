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

#downloadheader {
	display: flex;
	justify-content: center;

	padding: 5px;
}

#downloadplate {
	display: flex;
	justify-content: center;
	flex-direction: column;

	box-shadow: 8px 8px 8px darkblue;
	border-radius: 10px;

	background: cornsilk;
}

#actionbuttonplate {
	display: flex;
	justify-content: center;
	flex-direction: column;

	padding: 4px;

	box-shadow: 3px 3px 3px black;;
	border-radius: 4px;

	background: gray;
}

#downloadtable, td, th {
	padding: 8px;
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
					<table v-for="(directory, index) in directories" :key="index" id="downloadtable">
						<tr>
							<th>GCode</th>
							<th>Size</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
						<tr v-for="(log, index) in directory.files" :key="index">
							<td>{{ log.getName() }}</td>
							<td>{{ log.getSizeKBString() }}</td>
							<td>{{ log.lastModified }}</td>
							<td>
								<div id="actionbuttonplate" >
									<button @click="onDownloadClick(log)">Download</button>
									<button @click="onDeleteClick(log)">Delete</button>
								</div>
							</td>
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
import { Directory, File } from './index.js';
import saveAs from 'file-saver'
import Path from '../../utils/path.js'
import { mapActions } from 'vuex'

export default {
	data() {
		return {
			elevation: "2",
			logList: [],
			notdownloadable: true,
			directories: [],
			dataPath: "0:/sys/COBOD/Meminisse/data",
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

	},

	props: {
		debug: {
			required: false,
			type: Boolean,
			default: true
		}
	},

	methods: {
		...mapActions('machine', {
			machineDownload: 'download',
			machineDelete: 'delete',
			getFileList: 'getFileList'}),

		printd(text) {
			if (this.debug) console.log(text);
		},

		onClick() {
			this.printd("Button clicked");
		},

		onDownloadClick(file) {

			if (!(file instanceof File)) 
			{
				console.error("onDownloadClick wrong argument!");
				return;
			}

			this.machineDownload({ filename: Path.combine(this.dataPath, file.path), type: 'blob' }).then( (blob) => {
				saveAs(blob, file.getName());
			});
		},

		onDeleteClick(file) {
			if (!(file instanceof File)) 
			{
				console.error("onDeleteClick wrong argument!");
				return;
			}

			this.machineDelete(Path.combine(this.dataPath, file.path));
		},

		async updateFileList() {
			const path = this.dataPath;

			// Connect to the machine and get the inital file list
			const folders = await this.getFileList(path);

			// Go through every folder, and add logs
			await folders.forEach( async (item) => {
				if (item.isDirectory)
				{
					// Add to directories
					let directoryPath = Path.combine(path, item.name);
					let directory = new Directory(directoryPath, item.lastModified);
					this.directories.push(directory);

					// 
					let files = await this.getFileList(directory.path);
					files.forEach( file => {
						if (!file.isDirectory)
						{
							let filePath = Path.combine(item.name, file.name);
							let nfile = new File(filePath, false, file.size, file.lastModified);
							directory.addFile(nfile);
						}
					});

					// Sort the files in the directory
					directory.files.sort((a, b) => {
						return b.getName().localeCompare(a.getName());
					});
				}
			});

			return folders;
		},

		forceFileDownload(response, file) {
			if (!(file instanceof File))
			{
				console.error("forceFileDownload got wrong file argument!");
				return;
			}
			const url = window.URL.createObjectURL(new Blob([response.data]))
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', file.getName()) //or any other extension
			document.body.appendChild(link)
			link.click()
		},
	},

	/**
	 * This function is fired, when the component is loaded. It only runs when the plugin gets started.
	 */
	mounted: function() {
		this.printd("Meminisse is mounted!");
		this.updateFileList();
	}
}

</script>
