'use strict'

import { registerRoute } from '../../routes'
import Path from '../../utils/path.js'

import Meminisse from './Meminisse.vue'

registerRoute(Meminisse, {
	Job: {
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

export class File
{
	constructor(path, isDirectory, size, lastModified)
	{
		this.path = path;
		this.isDirectory = isDirectory;
		this.size = size;
		this.lastModified = lastModified;
	}

	getName() { return Path.extractFileName(this.path); }
}

export class Directory extends File
{
	constructor(path, lastModified)
	{
		super(path, true, 0, lastModified);
		this.subDirectories = [];
		this.files = [];
	}

	addSubDirectory(directory)
	{
		if (directory instanceof Directory) this.subDirectories.push(directory);
	}

	addFile(file)
	{
		if (file instanceof File) this.files.push(file);
	}
}
