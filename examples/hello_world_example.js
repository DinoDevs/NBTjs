/*
 * Example "hello_world.nbt"
 * for library NBTjs
 *
 * Copyright (c) DinoDevs
 */

// Load Required Modules
	// NBT library module
	var nbt = require(__dirname + '/../NBTjs/NBTjs');

// File to load
	// The hello_world example of the documentation
	var path = "hello_world.nbt";

	// NBT decoded object
	// if needed the data will be unzipped
	var nbtObj = nbt.decodeFile(path);

	// NBT to String (like the documentation examples format)
	// http://web.archive.org/web/20110723210920/http://www.minecraft.net/docs/NBT.txt
	var stringDocFormat = nbtObj.toString();
	console.log("The documentation format :");
	console.log(stringDocFormat);
	console.log("\n");

	// NBT to Json format (data types are lost)
	// All values are in strings
	var nbtJson = nbtObj.toJson();

	// Print in Json (Pretty Print)
	var nbtPrettyJson = nbtObj.toJsonString();
	console.log("The json format :");
	console.log(nbtPrettyJson);
	console.log("\n");

	// Get Data on the parsed format
	var parsedFormat = nbtObj.getData();
	console.log("Parsed format :");
	console.log(JSON.stringify(parsedFormat, null, 4));
	console.log("\n");

// Close Process
	process.exit(0);
