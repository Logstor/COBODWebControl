<style scoped>

h1 {
	font-size: xx-large;
}

#rootdiv {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

#maindiv {
	display: table;
	align-items: center;
	text-align: center;
}

#btndiv {
	display: flex;
	justify-content: center;
	align-items: center;
}

#bottomdiv {
	display: flex;
	flex-direction: row;
	justify-content: center;
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

	/*background: gray;*/
}

#actionbuttonplate {
	display: flex;
	justify-content: center;
	flex-direction: column;

	padding: 4px;

	box-shadow: 3px 3px 3px black;;
	border-radius: 4px;
}

#downloadtable, td, th {
	padding: 8px;
}

#refreshbutton {
	display: flex;
	justify-content: right;

	padding-left: 12px;
	padding-right: 4px;
}

</style>

<template>

	<div id="rootdiv">
		<div id="maindiv">
			<h1>
				Meminisse
			</h1>
		</div>
		
		<div id="bottomdiv">
			<div id="downloadplate" :style="downloadPlateColor">
				<div id="downloadheader">
					<h2>Downloadable logs</h2>
				</div>
				<div id="refreshbutton">
					<v-btn @click="updateFileList()" :color="currTheme">Refresh</v-btn>
				</div>
				<div v-if="directories.length !== 0 && directories[0].files.length !== 0">
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
								<v-btn @click="onDownloadClick(log)" :color="currTheme">Download</v-btn>
								<v-btn @click="onDeleteClick(log)" color="warning">Delete</v-btn>
							</td>
						</tr>
					</table>
				</div>
				<div v-else id="downloadlist">
					<table v-for="(directory, index) in directories" :key="index" id="downloadtable">
						<tr>
							<th>GCode</th>
							<th>Size</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
						<tr>
							<td>--- Empty ---</td>
							<td>--- Empty ---</td>
							<td>--- Empty ---</td>
							<td>--- Empty ---</td>
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
import { mapActions, mapState } from 'vuex'
import { log } from '../../utils/logging.js'

export default {
	data() {
		return {
			elevation: "2",
			logList: [],
			notdownloadable: true,
			directories: [],
			dataPath: "0:/sys/COBOD/Meminisse/data",
			confirmDeleteDialog: {
				show: false,
				title: "",
				prompt: "",
				path: "",
			},
		}
	},

	/**
	 * Private properties
	 */
	created: {
		
	},
	
	computed: {
		...mapState('settings', ['darkTheme']),
		...mapState('machine/model', ['state']),

		currTheme() {
			return this.darkTheme ? 'dark' : 'primary'; 
		},

		downloadPlateColor() {
			return this.darkTheme ? 'background: grey' : 'background: cornsilk';
		},
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

			// Only make it possible to delete logfiles if we aren't currently logging.
			if (this.state.status == 'idle')
			{
				// Show confirmation dialog before delete
				confirm(`Delete ${file.getName()}?`) ? this.onConfirmDelete(Path.combine(this.dataPath, file.path)) : this.onDismissDelete();
			}
			else
				log('error', "Delete Error", `Couldn't delete file: ${file.getName()}! Machine needs to be in idle!`);
		},

		onConfirmDelete(path) {
			this.printd("Confirmed Delete");
			this.machineDelete(path).then(this.updateFileList());
		},

		onDismissDelete() {
			this.printd("Cancelled Delete");
		},

		async updateFileList() {
			const path = this.dataPath;

			// Clear current directories
			this.clearDirectories();

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

		/**
		 * This is clearing the directories by setting the length to 0.
		 */
		clearDirectories() {
			this.directories.length = 0;
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
