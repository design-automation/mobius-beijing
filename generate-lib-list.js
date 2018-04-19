console.log("////////////////////////////////////////////");
console.log("Generating list of files in json-files....");
const filesFolder = './src/assets/json-files';
const fs = require('fs');


const readFiles = function(fileFolder){
	files = [];
	fs.readdirSync(fileFolder).forEach(file => {
	  files.push("\"" + file + "\"");
	});

	writeFile(files);
}

const writeFile = function(files){

	let fileString = "AllFiles = [" + files + " ]";

	fs.writeFile("./src/assets/json-files/jsonList.js", fileString, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	}); 
}


readFiles(filesFolder);