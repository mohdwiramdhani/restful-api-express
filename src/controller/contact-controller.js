import contactService from "../service/contact-service.js";
import fs from "fs";

const create = async (req, res, next) => {
    const files = req.files || [];
    try {
        const user = req.user;
        const request = req.body;

        console.log('Files received:', files);

        const result = await contactService.create(user, request, files);

        res.status(200).json({ data: result });
    } catch (e) {
        // Clean up temp files if an error occurs
        files.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error("Error deleting temp file:", err);
                }
            });
        });
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const result = await contactService.get(user, contactId);

        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    const files = req.files || [];
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const request = req.body;
        request.id = contactId;

        console.log('File received:', files);

        // Pass file if exists
        const result = await contactService.update(user, request, files);
        res.status(200).json({ data: result });
    } catch (e) {
        next(e);
    }
}



const remove = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;

        await contactService.remove(user, contactId);
        res.status(200).json({
            data: "OK"
        })
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {
        const user = req.user;
        const request = {
            name: req.query.name,
            email: req.query.email,
            phone: req.query.phone,
            page: req.query.page,
            size: req.query.size
        };

        const result = await contactService.search(user, request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    get,
    update,
    remove,
    search
}