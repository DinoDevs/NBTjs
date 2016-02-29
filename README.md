# NBTjs
A javascript library for opening NBT files

Can be used on **NodeJs** and a browser plug'n'play version will be released soon.

By using this library, you can read NBT format files, like Minecraft's *.dat files.
You can easy manage the data on a JSON format and preaty print them.

## Code Example

#### Data from file
Read the data from the a NBT file
```javascript
// Get an NBT decoded object by reading the file
// if needed the data will be unzipped
var nbtObj = nbt.decodeFile("hello_world.nbt");
```

#### Print data
Print the NBT data to the example documentation format
```javascript
// NBT to String
var stringDocFormat = nbtObj.toString();
console.log(stringDocFormat);
```
Output
```
TAG_Compound('hello world'): 1 entries
{
  TAG_String('name'): Bananrama
}
```

#### Data in JSON
Get the NBT data to a JSON format
```
// NBT to Json format (data types are lost)
// All values are in strings
var nbtJson = nbtObj.toJson();
```
Example JSON 
```json
{
  "hello world": {
    "name": "Bananrama"
  }
}
```

#### Data on a javascript object
The data are saved on an object as they are parsed.
```javascript
	// Get Data on the parsed format
	var parsedFormat = nbtObj.getData();
```
Parsed object format
```javascript
var parsedFormat = {
  "type": 10, // TAG_Compound
  "name": "hello world",
  "payload": [
    {
      "type": 8, // TAG_String
      "name": "name",
      "pos": 21,
      "payload": "Bananrama"
    }
  ]
}
```

## Read minecraft server's files from NodeJs

We started this library in order to read the *.dat files of our Minecraft server on our NodeJs project 

## Installation

Under Construction

## API Reference

Under Construction

## Tests

Under Construction

## Contributors

Under Construction

## License

Under Construction - MIT License
