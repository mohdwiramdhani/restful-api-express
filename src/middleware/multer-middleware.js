import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error.js";

// Define directories and configurations
const uploadConfigs = {
    photo: {
        directory: 'public/uploads/photos',
        maxSize: 1 * 1024 * 1024, // 1 MB
        allowedExtensions: /jpg|jpeg|png/
    },
    certificate: {
        directory: 'public/uploads/certificates',
        maxSize: 1 * 1024 * 1024, // 1 MB
        allowedExtensions: /pdf/
    }
};

// Ensure directories exist
Object.values(uploadConfigs).forEach(config => {
    if (!fs.existsSync(config.directory)) {
        fs.mkdirSync(config.directory, { recursive: true });
    }
});

// Custom storage configuration to dynamically set directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const config = uploadConfigs[file.fieldname];
        if (config) {
            cb(null, config.directory);
        } else {
            cb(new ResponseError(400, 'Invalid field name'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = uuidv4();
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
    const config = uploadConfigs[file.fieldname];
    if (config) {
        const extname = config.allowedExtensions.test(path.extname(file.originalname).toLowerCase());
        const mimetype = config.allowedExtensions.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new ResponseError(400, `Only ${config.allowedExtensions} files are allowed!`), false);
        }
    } else {
        cb(new ResponseError(400, 'Invalid field name'), false);
    }
};

// Middleware using .any() to allow multiple files from different fields
const multerMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: (req, file, cb) => {
            const config = uploadConfigs[file.fieldname];
            if (config) {
                return config.maxSize;
            }
            return 1 * 1024 * 1024; // Default to 1 MB
        }
    },
    fileFilter: fileFilter
}).any();

export default multerMiddleware;