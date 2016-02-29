/*
 * NBTjs
 * a library for opening NBT files
 * 
 * Version 1.0.0
 *
 * Copyright (c) DinoDevs
 */

// Load Required Modules
	// FileSystem module
	const fs = require('fs');
	// Zip module
	const zlib = require("zlib");
	// Big Numbers (by MikeMcl @ github)
	// Used for calculating long integers in javascript
	const Big = require(__dirname + "/requiredLibs/big");
	// Binary Parser (by Jonas Raoni Soares Silva)
	// Used for parsing binary/bytes to other types
	const BinaryParser = require(__dirname + "/requiredLibs/BinaryParser");

// NBT object
var NBT = (function(){

	// Constructor
	var NBT = function(data, options){
		options = typeof options !== 'undefined' ? options : {};
		data = typeof data !== 'undefined' ? data : false;

		if(data){
			this.parse(data);
		}
		
	};

	// Data
	NBT.prototype.data = null;
	// Parsed Data
	NBT.prototype.parsed_data = null;
	// Decode Position
	NBT.prototype.position = 0;

	// Binary Parser
	NBT.prototype.BinParser = new BinaryParser(true, true);

	// Parse Data
	NBT.prototype.parse = function(data){
		// Save data
		this.data = data;
		// Set position
		this.position = 0;

		// Start decode
		this.parsed_data = this.decode_TAG();
	}



	// Export Data Methods
	NBT.prototype.toString = function(node){
		node = typeof node !== 'undefined' ? node : this.parsed_data;

		// Find tag type name
		var s_type = "TAG_Unknown";
		if(node.type){
			for(type_name in this.TAG_CODE){
				if(this.TAG_CODE[type_name] == node.type){
					s_type = type_name;
				}
			}
		}

		// Find name
		var s_name = "None";
		if(node.name){
			s_name = "'" + node.name + "'";
		}

		// Check payload
		var s_payload = " NULL";
		if(node.payload){
			if(node.payload instanceof Array){
				s_payload = " " + node.payload.length + " entries\n{";
				for (var i=0; i<node.payload.length; i++) {
					s_payload += "\n    "+this.toString(node.payload[i]).replace(/\n/g, "\n    ");
				}
				s_payload += "\n}";
			}
			else{
				s_payload = " " + this.getValueToString(node);
			}
		}

		return s_type + "(" + s_name + "):" + s_payload;
	}
	NBT.prototype.toJsonString = function(){
		return JSON.stringify(this.toJson(), null, 4);
	}
	NBT.prototype.toJson = function(node){
		// If no start node
		if(typeof node == 'undefined'){
			// First node as start
			node =  this.parsed_data;

			// If fist node has a name
			if(node.name && node.name.length>0){
				// Make a parrent node
				var json = {};
				json[node.name] = this.toJson(node);
				return json;
			}
		}


		var json;

		// If array payload
		if(node.type == this.TAG_CODE.TAG_Byte_Array || node.type == this.TAG_CODE.TAG_Int_Array || node.type == this.TAG_CODE.TAG_List){
			json = [];
			for (var i=0; i<node.payload.length; i++) {
				json.push( this.toJson(node.payload[i]) );
			}
			return json;
		}

		// If Object payload
		else if(node.payload instanceof Array){
			json = {};
			for (var i=0; i<node.payload.length; i++) {
				json[node.payload[i].name] = this.toJson(node.payload[i]);
			}
			return json;
		}

		// If value payload
		else{
			return this.getValueToString(node);
		}
	}
	NBT.prototype.getByQuery = function(query, json){
		json = typeof json !== 'undefined' ? json : this.toJson();

		// Split query to ids
		var ids = query.replace(/\[/,".[").split('.');

		// Traverse paths
		for (var i=0; i<ids.length; i++) {
			// If array selector
			if(ids[i].match(/\[(\d+)\]/i)){
				// Parse int
				ids[i] = parseInt( ids[i].match(/\[(\d+)\]/i)[1]);
			}

			// If exist
			if(json[ids[i]]){
				json = json[ids[i]];
			}
			// On error
			else{
				return null;
			}
		}

		return json;
	}

	NBT.prototype.getData = function(){
		return this.parsed_data;
	}


	NBT.prototype.getValueToString = function(node){
		if(!node.type || !node.payload){
			return "NULL";
		}

		// Select tag's type
		switch(node.type){
			// TAG_Byte
			case this.TAG_CODE.TAG_Byte :
				return this.stringToInteger(node.payload, 1).toString();
			// TAG_Short
			case this.TAG_CODE.TAG_Short :
				return this.stringToInteger(node.payload, 2).toString();
			// TAG_Int
			case this.TAG_CODE.TAG_Int :
				return this.stringToInteger(node.payload, 4).toString();
			// TAG_Long
			case this.TAG_CODE.TAG_Long :
				return this.stringToInteger(node.payload, 8).toString();
			// TAG_Float
			case this.TAG_CODE.TAG_Float : 
				return this.BinParser.toFloat(node.payload).toString();
			// TAG_Double
			case this.TAG_CODE.TAG_Double : 
				return this.BinParser.toDouble(node.payload).toString();
			// TAG_String
			case this.TAG_CODE.TAG_String : 
				var temp = JSON.stringify(node.payload).replace(/'/g,"\\'").replace(/\"/g,"\"");
				return temp.substring(1, temp.length-1);

			// Error
			default : 
				return "NULL";
		}
	}
	NBT.prototype.stringToInteger = function(string, n){
		// Get length
		var length = 0;
		var position = 0;
		var i = n-1;

		// Integer is small enought
		if(n <= 4){
			length = 0;
			while(i >= 0){
				length += (string[position++].charCodeAt(0) << i*8);
				i--;
			}
		}
		// Integer too big
		else{
			length = new Big(0);
			var shift, number;
			while(i >= 0){
				length = length.plus( (new Big( string[position++].charCodeAt(0) )).times( (new Big(2)).pow(i*8) ) );
				i--;
			}
		}

		// Return data
		return length.toString();
	}
	NBT.prototype.stringToDouble = function(string){
		var parser = new BinaryParser(true, true);
		return BinaryParser.toDouble(string);
	}



	// Define Tag codes
	NBT.prototype.TAG_CODE = {
		TAG_End : 0,
		TAG_Byte : 1,
		TAG_Short : 2,
		TAG_Int : 3,
		TAG_Long : 4,
		TAG_Float : 5,
		TAG_Double : 6,
		TAG_Byte_Array : 7,
		TAG_String : 8,
		TAG_List : 9,
		TAG_Compound : 10,
		TAG_Int_Array : 11
	};

	// Decode
	NBT.prototype.decode_TAG = function(){
		// Get tag type (1 byte = 1 char) and move pointer
		var tagType = this.get_DATA_Length(1);

		// Select tag's method
		switch(tagType){
			// TAG_End
			case this.TAG_CODE.TAG_End : return this.decode_TAG_End();
			// TAG_Byte
			case this.TAG_CODE.TAG_Byte : return this.decode_TAG_Byte();
			// TAG_Short
			case this.TAG_CODE.TAG_Short : return this.decode_TAG_Short();
			// TAG_Int
			case this.TAG_CODE.TAG_Int : return this.decode_TAG_Int();
			// TAG_Long
			case this.TAG_CODE.TAG_Long : return this.decode_TAG_Long();
			// TAG_Float
			case this.TAG_CODE.TAG_Float : return this.decode_TAG_Float();
			// TAG_Double
			case this.TAG_CODE.TAG_Double : return this.decode_TAG_Double();
			// TAG_Byte_Array
			case this.TAG_CODE.TAG_Byte_Array : return this.decode_TAG_Byte_Array();
			// TAG_String
			case this.TAG_CODE.TAG_String : return this.decode_TAG_String();
			// TAG_List
			case this.TAG_CODE.TAG_List : return this.decode_TAG_List();
			// TAG_Compound
			case this.TAG_CODE.TAG_Compound : return this.decode_TAG_Compound();
			// TAG_Int_Array
			case this.TAG_CODE.TAG_Int_Array : return this.decode_TAG_Int_Array();
			// Error
			default : this.decode_TAG_Error(tagType);
		}
		return 0;
	};
	NBT.prototype.decode_UNNAMED_TAG = function(){
		// Get tag type (1 byte = 1 char) and move pointer
		var tagType = this.get_DATA_Length(1);

		// Select tag's method
		return this.decode_LIST_TAG(tagType);
	};
	NBT.prototype.decode_LIST_TAG = function(tagType){
		// Select tag's method
		switch(tagType){
			// TAG_End
			case this.TAG_CODE.TAG_End : return this.decode_DATA_End();
			// TAG_Byte
			case this.TAG_CODE.TAG_Byte : return this.decode_DATA_Byte();
			// TAG_Short
			case this.TAG_CODE.TAG_Short : return this.decode_DATA_Short();
			// TAG_Int
			case this.TAG_CODE.TAG_Int : return this.decode_DATA_Int();
			// TAG_Long
			case this.TAG_CODE.TAG_Long : return this.decode_DATA_Long();
			// TAG_Float
			case this.TAG_CODE.TAG_Float : return this.decode_DATA_Float();
			// TAG_Double
			case this.TAG_CODE.TAG_Double : return this.decode_DATA_Double();
			// TAG_Byte_Array
			case this.TAG_CODE.TAG_Byte_Array : return this.decode_DATA_Byte_Array();
			// TAG_String
			case this.TAG_CODE.TAG_String : return this.decode_DATA_String();
			// TAG_List
			case this.TAG_CODE.TAG_List : return this.decode_DATA_List();
			// TAG_Compound
			case this.TAG_CODE.TAG_Compound : return this.decode_DATA_Compound();
			// TAG_Int_Array
			case this.TAG_CODE.TAG_Int_Array : return this.decode_DATA_Int_Array();
			// Error
			default : this.decode_DATA_Error(tagType);
		}
		return 0;
	};

	// TAG_End
	NBT.prototype.decode_TAG_End = function(){
		return this.decode_DATA_End();
	}
	NBT.prototype.decode_DATA_End = function(){
		return 0;
	}


	// TAG_Byte
	NBT.prototype.decode_TAG_Byte = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Byte
		var struct = this.decode_DATA_Byte();

		return this.make_DATA_Structure(name, struct);
	}
	// Byte decode
	NBT.prototype.decode_DATA_Byte = function(){
		// Get Position
		var pos = this.position;
		// Get Byte (1 bytes)
		var payload = this.get_DATA_Bytes(1);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Byte, payload, pos);
	}


	// TAG_Short
	NBT.prototype.decode_TAG_Short = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Short
		var struct = this.decode_DATA_Short();

		return this.make_DATA_Structure(name, struct);
	}
	// Short decode
	NBT.prototype.decode_DATA_Short = function(){
		// Get Position
		var pos = this.position;
		// Get Short (2 bytes)
		var payload = this.get_DATA_Bytes(2);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Short, payload, pos);
	}


	// TAG_Int
	NBT.prototype.decode_TAG_Int = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Int
		var struct = this.decode_DATA_Int();

		return this.make_DATA_Structure(name, struct);
	}
	// Int decode
	NBT.prototype.decode_DATA_Int = function(){
		// Get Position
		var pos = this.position;
		// Get Int (4 bytes)
		var payload = this.get_DATA_Bytes(4);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Int, payload, pos);
	}


	// TAG_Long
	NBT.prototype.decode_TAG_Long = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Long
		var struct = this.decode_DATA_Long();

		return this.make_DATA_Structure(name, struct);
	}
	// Long decode
	NBT.prototype.decode_DATA_Long = function(){
		// Get Position
		var pos = this.position;
		// Get Long (8 bytes)
		var payload = this.get_DATA_Bytes(8);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Long, payload, pos);
	}


	// TAG_Float
	NBT.prototype.decode_TAG_Float = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Float
		var struct = this.decode_DATA_Float();

		return this.make_DATA_Structure(name, struct);
	}
	// Float decode
	NBT.prototype.decode_DATA_Float = function(){
		// Get Position
		var pos = this.position;
		// Get Float (4 bytes)
		var payload = this.get_DATA_Bytes(4);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Float, payload, pos);
	}


	// TAG_Double
	NBT.prototype.decode_TAG_Double = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Double
		var struct = this.decode_DATA_Double();

		return this.make_DATA_Structure(name, struct);
	}
	// Double decode
	NBT.prototype.decode_DATA_Double = function(){
		// Get Position
		var pos = this.position;
		// Get Double (8 bytes)
		var payload = this.get_DATA_Bytes(8);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Double, payload, pos);
	}


	// TAG_Byte_Array
	NBT.prototype.decode_TAG_Byte_Array = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Byte_Array
		var struct = this.decode_DATA_Byte_Array();

		return this.make_DATA_Structure(name, struct);
	}
	NBT.prototype.decode_DATA_Byte_Array = function(){
		// Get Byte_Array
		var payload = [];

		var length = this.get_DATA_Length(4);

		var item;
		for (var i=0; i<length; i++) {
			item = this.decode_DATA_Byte();
			payload.push(item);
		}

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Byte_Array, payload);
	}

	// TAG_String
	NBT.prototype.decode_TAG_String = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get String
		var struct = this.decode_DATA_String();

		// Return data
		return this.make_DATA_Structure(name, struct);
	}
	// String decode
	NBT.prototype.decode_DATA_String = function(){
		// Get Position
		var pos = this.position;
		// Get String
		var payload = this.decode_DATA_Name();

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_String, payload, pos);
	}
	// String decode
	NBT.prototype.decode_DATA_Name = function(){
		// Name length
		var length = this.get_DATA_Length(2);;
		// Return Name
		return this.get_DATA_Bytes(length);
	}


	// TAG_List
	NBT.prototype.decode_TAG_List = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get List
		var struct = this.decode_DATA_List();

		// Return data
		return this.make_DATA_Structure(name, struct);
	}
	NBT.prototype.decode_DATA_List = function(){
		// Init List
		var payload = [];
		// Get list's data type
		var typeId = this.get_DATA_Length(1);
		// Get list's data length
		var length = this.get_DATA_Length(4);
		
		// If list is not an end tipe
		if(typeId != 0){
			var item;
			// Get each list's item
			for (var i=0; i<length; i++) {
				item = this.decode_LIST_TAG(typeId);
				payload.push(item);
			}
		}

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_List, payload);
	}


	// TAG_Compound
	NBT.prototype.decode_TAG_Compound = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get payload
		var struct = this.decode_DATA_Compound();

		return this.make_DATA_Structure(name, struct);
	}
	NBT.prototype.decode_DATA_Compound = function(){
		// Get payload
		var payload = [];

		var item;
		do{
			// Get payload item
			item = this.decode_TAG();
			if(item != 0){
				payload.push(item);
			}

		}while(item != 0);

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Compound, payload);
	}


	// TAG_Int_Array
	NBT.prototype.decode_TAG_Int_Array = function(){
		// Get Name
		var name = this.decode_DATA_Name();
		// Get Int_Array
		var struct = this.decode_DATA_Int_Array();

		return this.make_DATA_Structure(name, struct);
	}
	NBT.prototype.decode_DATA_Int_Array = function(){
		// Get Int_Array
		var payload = [];

		var length = this.get_DATA_Length(4);

		var item;
		for (var i=0; i<length; i++) {
			item = this.decode_DATA_Int();
			payload.push(item);
		}

		return this.make_DATA_ListStructure(this.TAG_CODE.TAG_Int_Array, payload);
	}


	// Error
	NBT.prototype.decode_TAG_Error = function(errorType){
		return this.decode_DATA_Error(errorType);
	}
	// Error
	NBT.prototype.decode_DATA_Error = function(errorType){
		console.log("Error : "+errorType);
		return errorType;
	}



	// Data Decode
	NBT.prototype.get_DATA_Bytes = function(n){
		// Get Data
		var data = this.data.substring(this.position, n + this.position);
		// Move Pointer after Name
		this.position += n;

		// Return data
		return data;
	}
	// Get a number
	NBT.prototype.get_DATA_Length = function(n){
		// Get length
		var length = 0;
		var i = n-1;

		while(i >= 0){
			length += (this.data[this.position++].charCodeAt(0) << i*8);
			i--;
		}

		// Return data
		return length;
	}
	// Data Struct
	NBT.prototype.make_DATA_Structure = function(name, structure){
		if(typeof structure.pos !== 'undefined'){
			// Return structure
			return {
				"type" : structure.type,
				"name" : name,
				"pos" : structure.pos,
				"payload" : structure.payload
			};
		}
		else{
			// Return structure
			return {
				"type" : structure.type,
				"name" : name,
				"payload" : structure.payload
			};
		}
	}
	NBT.prototype.make_DATA_ListStructure = function(type, payload, pos){
		if(typeof pos !== 'undefined'){
			return {
				"type" : type,
				"pos" : pos,
				"payload" : payload
			};
		}
		else{
			return {
				"type" : type,
				"payload" : payload
			};
		}
	}


	return NBT;
})();


var NBTtools = {
	stringToBytes : function(str){
		var ch, st, re = [];
		for (var i = 0; i < str.length; i++ ) {
			ch = str.charCodeAt(i);  // get char 
			st = [];                 // set up "stack"
			do{
				st.push( ch & 0xFF );  // push byte to stack
				ch = ch >> 8;          // shift value down by 1 byte
			}
			while(ch);
			// add stack contents to result
			// done because chars have "wrong" endianness
			re = re.concat( st.reverse() );
		}
		// return an array of bytes
		return re;
	}
}


// Export libNBT interface
module.exports = (function(){
	var lib = {};

	// Decode general data
	// 	will try to find the data type
	// 	will try to check if data are zipped
	lib.decode = function(data){

		// If first byte is not 10 try to unzip it
		if(data[0].charCodeAt(0) != 10){
			data = lib.unzip(data);
		}

		var nbt = new NBT(data);
		return nbt;
	};

	// Decode a file
	lib.decodeFile = function(path){
		// Read file in a buffer
		var byte = fs.readFileSync(path);

		// Convert bytes to string
		var data = lib.bytesToString(byte);

		// Decode data
		return lib.decode(data);
	}

	// Convert Bytes to String
	lib.bytesToString = function(bytes){
		// Convert bytes to string
		var data = "";
		for (var i=0; i<bytes.length; i++) {
			data += String.fromCharCode(bytes[i]);
		}

		// Return string data
		return data;
	}
	// Convert Bytes to String
	lib.stringToBytes = function(string){
		// Convert bytes to string
		var data = [];
		for (var i=0; i<string.length; i++) {
			data.push(string.charCodeAt(i));
		}

		// Return bytes data
		return data;
	}

	// Data Unzip
	lib.unzip = function(data){
		var buffer;
		
		// String input
		if(typeof data == "string"){
			// Convert to bytes and then buffer
			buffer = new Buffer(lib.stringToBytes(data));
		}
		// Array was given
		else if( data instanceof Array ){
			// Convert to buffer
			buffer = new Buffer(data);
		}
		// Buffer was given
		else if( data instanceof Buffer ){
			// Wrap to buffer
			buffer = data;
		}
		// Else try to convert it to Buffer
		else{
			// Convert to buffer
			buffer = new Buffer(data);
		}

		data = zlib.unzipSync(buffer);

		return lib.bytesToString(data);
	};


	return lib;
})();
