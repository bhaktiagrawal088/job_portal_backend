import multer from "multer";

// Step 1: Use memory storage
const storage = multer.memoryStorage();

// Step 2: Create a Multer instance
// const upload = multer({ storage });
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 1024 * 1024 * 5 }, // 5MB size limit
// });



// Step 3: Export the singleUpload middleware
export const singleUpload = multer({storage}).single("file");

