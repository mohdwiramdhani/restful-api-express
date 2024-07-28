import contactService from "../service/contact-service.js";
import fs from "fs";

const create = async (req, res, next) => {
    try {
        const user = req.user;
        const request = req.body;

        if (req.file) {
            request.profile_picture = req.file.path.replace(/\\/g, '/');
        }

        const result = await contactService.create(user, request);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

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
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const request = req.body;
        request.id = contactId;

        const oldContact = await contactService.get(user, contactId);

        if (req.file) {
            request.profile_picture = req.file.path.replace(/\\/g, '/');
        }

        const result = await contactService.update(user, request);

        if (req.file && oldContact.profile_picture) {
            fs.unlink(oldContact.profile_picture, (err) => {
                if (err) {
                    console.error("Error deleting old profile picture:", err);
                }
            });
        }

        res.status(200).json({
            data: result
        });
    } catch (e) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting uploaded file:", err);
                }
            });
        }
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