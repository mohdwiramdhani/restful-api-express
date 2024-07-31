import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error.js"; // Import ResponseError

// Direktori upload
const uploadDir = 'public/uploads/photos';

// Buat direktori jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup penyimpanan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4(); // Generate UUID
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// Filter file untuk tipe tertentu
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new ResponseError(400, 'Only jpg, jpeg, and png files are allowed!'), false);
    }
};

// Setup Multer dengan batasan ukuran dan filter file
const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Batas ukuran file 1MB
    fileFilter: fileFilter // Filter file
});

export default upload;
