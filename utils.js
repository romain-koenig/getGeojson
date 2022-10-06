const fsLibrary = require('fs');

const sortAlpha = (a, b) => a.name < b.name ? -1 : 1;
exports.sortAlpha = sortAlpha;


const logging = content => console.log(content);
exports.logging = logging;


const writeFile = (filePath, content) => {
	fsLibrary.writeFile(filePath, content, (error) => {
		// In case of a error throw err exception. 
		if (error)
			throw error;
	});
};
exports.writeFile = writeFile;