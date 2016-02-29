/*
 * Example "bigtest.nbt"
 * for library NBTjs
 *
 * Copyright (c) DinoDevs
 */

// Load Required Modules
	// NBT library module
	var nbt = require(__dirname + '/../NBTjs/NBTjs');

// File to load
	// The bigtest example of the documentation
	var path = "bigtest.nbt";

	// NBT decoded object
	// if needed the data will be unzipped
	var nbtObj = nbt.decodeFile(path);

	// NBT to String (like the documentation examples format)
	// http://web.archive.org/web/20110723210920/http://www.minecraft.net/docs/NBT.txt
	var stringDocFormat = nbtObj.toString();

	// NBT to Json format (data types are lost)
	// All values are in strings
	var nbtJson = nbtObj.toJson();

	// Get a value from the Json Format
	// If you want to begin fro a node provide it
	var longInString = nbtObj.getByQuery("Level.longTest", nbtJson);
	// Or let the lib create and read the default json fromat
	var nameInString = nbtObj.getByQuery("Level.nested compound test.ham.name");

	// Get Data on the parsed format
	var parsedFormat = nbtObj.getData();

// Close Process
	process.exit(0);
