import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFilePath = (type, filename) => path.join(__dirname, `../../uploads/${type}/${filename}`);

export const checkFileExists = async (type, filename) => {
    const filePath = getFilePath(type, filename);
    try {
        await fs.access(filePath);
        return filePath;
    } catch {
        throw new Error('File not found');
    }
};