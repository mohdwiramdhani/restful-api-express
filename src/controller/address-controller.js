import addressService from "../service/address-service.js";
import fs from "fs"

const create = async (req, res, next) => {
    let files = {};
    try {
        const user = req.user;
        const request = req.body;
        const contactId = req.params.contactId;

        if (req.files) {
            req.files.forEach(file => {
                files[file.fieldname] = file.path.replace(/\\/g, '/');
            });
        }

        console.log("🚀 ~ create ~ files:", files)
        const result = await addressService.create(user, contactId, request, files);

        res.status(200).json({ data: result });
    } catch (e) {
        Object.values(files).forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        next(e);
    }
};

const get = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const addressId = req.params.addressId;

        const result = await addressService.get(user, contactId, addressId);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const addressId = req.params.addressId;
        const request = req.body;
        request.id = addressId;

        const result = await addressService.update(user, contactId, request);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const addressId = req.params.addressId;

        const result = await addressService.remove(user, contactId, addressId);

        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e);
    }
}

const list = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;

        const result = await addressService.list(user, contactId);

        res.status(200).json({
            data: result
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
    list
}