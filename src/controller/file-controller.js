import { checkFileExists } from '../service/file-service.js';

const getFile = async (req, res) => {
    const { type, filename } = req.params;

    try {
        const filePath = await checkFileExists(type, filename);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export default {
    getFile
}