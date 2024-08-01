import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error.js";

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
    }
};

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
            if (file.size > config.maxSize) {
                return cb(new ResponseError(400, `File size should not exceed ${config.maxSize / (1024 * 1024)} MB`), false);
            }
            cb(null, true);
        } else {
            cb(new ResponseError(400, `Only ${config.allowedExtensions} files are allowed!`), false);
        }
    } else {
        cb(new ResponseError(400, 'Invalid field name'), false);
    }
};

const multerMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024 // Set a default file size limit
    },
    fileFilter: fileFilter
}).any();

export default multerMiddleware;