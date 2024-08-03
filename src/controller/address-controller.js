import addressService from "../service/address-service.js";
import { saveFiles, deleteFiles } from "../middleware/multer-middleware.js";
import ExcelJS from 'exceljs';

const create = async (req, res, next) => {
    let savedFiles = [];
    try {
        const user = req.user;
        const request = req.body;
        const contactId = req.params.contactId;

        if (req.files) {
            savedFiles = saveFiles(req.files);
        }

        const result = await addressService.create(user, contactId, request, savedFiles);
        res.status(200).json({ data: result });
    } catch (e) {
        deleteFiles(savedFiles);
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
};

const update = async (req, res, next) => {
    let savedFiles = [];
    try {
        const user = req.user;
        const contactId = req.params.contactId;
        const addressId = req.params.addressId;
        const request = req.body;
        request.id = addressId;

        if (req.files) {
            savedFiles = saveFiles(req.files);
        }

        const result = await addressService.update(user, contactId, request, savedFiles);

        res.status(200).json({
            data: result
        });
    } catch (e) {
        deleteFiles(files);
        next(e);
    }
};

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
};

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
};

const exportToExcel = async (req, res, next) => {
    try {
        const user = req.user;
        const contactId = req.params.contactId;

        const addresses = await addressService.list(user, contactId);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Addresses');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Street', key: 'street', width: 30 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'Province', key: 'province', width: 20 },
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Postal Code', key: 'postal_code', width: 10 }
        ];

        addresses.forEach(address => {
            worksheet.addRow({
                id: address.id,
                street: address.street,
                city: address.city,
                province: address.province,
                country: address.country,
                postal_code: address.postal_code
            });
        });

        const filename = `contact${contactId}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (e) {
        next(e);
    }
};


export default {
    create,
    get,
    update,
    remove,
    list,
    exportToExcel
};