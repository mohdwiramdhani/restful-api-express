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

// Function to create dynamic storage
const createDynamicStorage = () => multer.diskStorage({
    destination: (req, file, cb) => {
        let dest;
        switch (file.fieldname) {
            case 'profile_picture':
                dest = 'public/images/profiles/';
                break;
            case 'certificate':
                dest = 'public/files/certificates/';
                break;
            case 'location_picture':
                dest = 'public/images/locations/';
                break;
            default:
                dest = 'public/uploads/';
        }
        ensureDirectoryExistence(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${extname}`;
        cb(null, fileName);
    }
});

// Function to create dynamic file filter
const createDynamicFilter = () => (req, file, cb) => {
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

// Middleware setup
export const uploadFile = multer({
    storage: createDynamicStorage(),
    fileFilter: createDynamicFilter(),
    limits: {
        fileSize: 1 * 1024 * 1024 // Default to 2 MB for all files
    }
});