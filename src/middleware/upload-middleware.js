import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Fungsi untuk memastikan direktori ada
const ensureDirectoryExistence = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Konfigurasi untuk gambar profil
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'public/images/profiles/';
        ensureDirectoryExistence(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${extname}`;
        cb(null, fileName);
    }
});

// Konfigurasi untuk gambar alamat
const streetStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'public/images/streets/';
        ensureDirectoryExistence(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${extname}`;
        cb(null, fileName);
    }
});

// Konfigurasi untuk file PDF
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'public/files/';
        ensureDirectoryExistence(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${extname}`;
        cb(null, fileName);
    }
});

// Filter untuk gambar
const imageFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
};

// Filter untuk file PDF
const pdfFilter = (req, file, cb) => {
    const fileTypes = /pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: PDFs Only!'));
    }
};

// Middleware untuk upload file
export const uploadProfile = multer({ storage: profileStorage, fileFilter: imageFilter, limits: { fileSize: 1 * 1024 * 1024 } });
export const uploadStreet = multer({ storage: streetStorage, fileFilter: imageFilter, limits: { fileSize: 1 * 1024 * 1024 } });
export const uploadPDF = multer({ storage: pdfStorage, fileFilter: pdfFilter, limits: { fileSize: 1 * 1024 * 1024 } });