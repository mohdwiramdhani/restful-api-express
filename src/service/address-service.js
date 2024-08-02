import { validate } from "../validation/validation.js";
import { getContactValidation } from "../validation/contact-validation.js";
import {
    createAddressValidation, getAddressValidation, updateAddressValidation
} from "../validation/address-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import fs from "fs";

const checkContactMustExists = async (user, contactId) => {
    contactId = validate(getContactValidation, contactId);

    const totalContactInDatabase = await prismaClient.contact.count({
        where: {
            username: user.username,
            id: contactId
        }
    });

    if (totalContactInDatabase !== 1) {
        throw new ResponseError(404, "contact is not found");
    }

    return contactId;
};

const create = async (user, contactId, request, files) => {
    contactId = await checkContactMustExists(user, contactId);

    const address = validate(createAddressValidation, request);
    address.contact_id = contactId;

    address.location = files.find(file => file.fieldname === 'location')?.path || null;

    try {
        const newAddress = await prismaClient.address.create({
            data: address,
            select: {
                id: true,
                street: true,
                city: true,
                province: true,
                country: true,
                postal_code: true,
                location: true
            }
        });

        return newAddress;
    } catch (error) {
        throw error;
    }

};

const get = async (user, contactId, addressId) => {
    contactId = await checkContactMustExists(user, contactId);
    addressId = validate(getAddressValidation, addressId);

    const address = await prismaClient.address.findFirst({
        where: {
            contact_id: contactId,
            id: addressId
        },
        select: {
            id: true,
            street: true,
            city: true,
            province: true,
            country: true,
            postal_code: true
        }
    });

    if (!address) {
        throw new ResponseError(404, "address is not found");
    }

    return address;
};

const update = async (user, contactId, request, files) => {
    contactId = await checkContactMustExists(user, contactId);
    const address = validate(updateAddressValidation, request);

    const updateFile = (oldFile, newFile) => {
        if (newFile) {
            if (oldFile && fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile);
            }
            return newFile;
        }
        return oldFile;
    };

    const oldAddress = await prismaClient.address.findFirst({
        where: {
            id: address.id
        },
        select: {
            location: true
        }
    });

    if (!oldAddress) {
        throw new ResponseError(404, "Address is not found");
    }

    address.location = updateFile(oldAddress.location, files.location);

    const totalAddressInDatabase = await prismaClient.address.count({
        where: {
            contact_id: contactId,
            id: address.id
        }
    });

    if (totalAddressInDatabase !== 1) {
        throw new ResponseError(404, "address is not found");
    }

    return prismaClient.address.update({
        where: {
            id: address.id
        },
        data: {
            street: address.street,
            city: address.city,
            province: address.province,
            country: address.country,
            postal_code: address.postal_code,
            location: address.location
        },
        select: {
            id: true,
            street: true,
            city: true,
            province: true,
            country: true,
            postal_code: true,
            location: true
        }
    });
};

const remove = async (user, contactId, addressId) => {
    contactId = await checkContactMustExists(user, contactId);
    addressId = validate(getAddressValidation, addressId);

    const totalAddressInDatabase = await prismaClient.address.count({
        where: {
            contact_id: contactId,
            id: addressId
        }
    });

    if (totalAddressInDatabase !== 1) {
        throw new ResponseError(404, "address is not found");
    }

    return prismaClient.address.delete({
        where: {
            id: addressId
        }
    });
};

const list = async (user, contactId) => {
    contactId = await checkContactMustExists(user, contactId);

    return prismaClient.address.findMany({
        where: {
            contact_id: contactId
        },
        select: {
            id: true,
            street: true,
            city: true,
            province: true,
            country: true,
            postal_code: true
        }
    });
};

export default {
    create,
    get,
    update,
    remove,
    list
};