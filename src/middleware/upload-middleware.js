import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Function to ensure directory exists
const ensureDirectoryExistence = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Storage configuration with a temporary directory
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'temp/uploads/';
        ensureDirectoryExistence(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${extname}`;
        cb(null, fileName);
    }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
    const fileTypes = {
        'profile_picture': /jpeg|jpg|png/,
        'certificate': /pdf/,
        'location_picture': /jpeg|jpg|png/
    };
    const allowedTypes = fileTypes[file.fieldname];
    if (allowedTypes) {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
    }
    cb(new Error('Error: File type not allowed!'));
};

export const uploadFile = multer({
    storage: tempStorage,
    fileFilter,
    limits: {
        fileSize: 1 * 1024 * 1024 // 1 MB
    }
});

export default uploadFile;