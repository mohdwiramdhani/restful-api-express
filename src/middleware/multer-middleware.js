import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error.js";

// Configuration object for different types of uploads
const uploadConfigs = {
    photo: {
        directory: 'public/uploads/photos',
        maxSize: 1 * 1024 * 1024,
        allowedExtensions: /jpg|jpeg|png/
    },
    certificate: {
        directory: 'public/uploads/certificates',
        maxSize: 2 * 1024 * 1024,
        allowedExtensions: /pdf/
    },
    location: {
        directory: 'public/uploads/locations',
        maxSize: 1 * 1024 * 1024,
        allowedExtensions: /jpg|jpeg|png/
    }
};

// Ensure directories exist
Object.values(uploadConfigs).forEach(config => {
    if (!fs.existsSync(config.directory)) {
        fs.mkdirSync(config.directory, { recursive: true });
    }
});

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

// Export a function to create the middleware with specific fields
export const multerMiddleware = (fields) => {
    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: fields.reduce((maxSize, field) => {
                const config = uploadConfigs[field.name];
                return config ? Math.min(maxSize, config.maxSize) : maxSize;
            }, Infinity)
        }
    }).fields(fields);
};