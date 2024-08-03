import multer from "multer";
import path from "path";
import fs from "fs";
import { ResponseError } from "../error/response-error.js";
import { v4 as uuidv4 } from "uuid";

const uploadConfigs = {
    photo: {
        directory: 'uploads/photos',
        maxSize: 2 * 1024 * 1024,
        allowedExtensions: /jpg|jpeg|png/
    },
    certificate: {
        directory: 'uploads/certificates',
        maxSize: 1 * 1024 * 1024,
        allowedExtensions: /pdf/
    },
    location: {
        directory: 'uploads/locations',
        maxSize: 1 * 1024 * 1024,
        allowedExtensions: /jpg|jpeg|png/
    }
};

const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
};

const validateFiles = (files) => {
    let validationErrors = [];
    let validFiles = [];

    for (const [fieldname, fileArray] of Object.entries(files)) {
        fileArray.forEach(file => {
            const config = uploadConfigs[fieldname];
            if (config) {
                if (file.size > config.maxSize) {
                    validationErrors.push(`File size for ${fieldname} exceeds the limit.`);
                }

                const extname = config.allowedExtensions.test(path.extname(file.originalname).toLowerCase());
                const mimetype = config.allowedExtensions.test(file.mimetype);
                if (!extname || !mimetype) {
                    validationErrors.push(`Invalid file type for ${fieldname}. Allowed types are ${config.allowedExtensions}.`);
                } else {
                    validFiles.push({ fieldname, file });
                }
            } else {
                validationErrors.push(`Invalid field name: ${fieldname}`);
            }
        });
    }

    if (validationErrors.length > 0) {
        throw new ResponseError(400, validationErrors.join(' '));
    }

    return validFiles;
};

const saveFiles = (files) => {
    let savedFiles = [];
    const validFiles = validateFiles(files);

    validFiles.forEach(({ fieldname, file }) => {
        const config = uploadConfigs[fieldname];
        const uniqueName = uuidv4() + path.extname(file.originalname);
        const savePath = path.join(config.directory, uniqueName);
        ensureDirectoryExistence(savePath);
        fs.writeFileSync(savePath, file.buffer);
        savedFiles.push({ fieldname, path: path.posix.normalize(savePath.replace(/\\/g, '/')) });
    });

    return savedFiles;
};

const deleteFiles = (files) => {
    files.forEach(file => {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    });
};

const storage = multer.memoryStorage();

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

export const multerMiddleware = (fields) => {
    return multer({
        storage: storage,
        fileFilter: fileFilter,
    }).fields(fields);
};

export {
    saveFiles,
    deleteFiles
};