import DataUriParser from 'datauri/parser.js';
import path from 'path';

const getDataUri =  (file) => {
    // if (!file) throw new Error("File is missing!"); // Add this error handling

    const parser = new DataUriParser(); // Create an instance of DataUriParser
    const extName = path.extname(file.originalname).toString(); // Get file extension from the original file name
    return parser.format(extName, file.buffer); // Convert the file buffer into a data URI
};

export default getDataUri;
