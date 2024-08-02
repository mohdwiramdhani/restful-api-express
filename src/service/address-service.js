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

    try {
        const newAddress = await prismaClient.address.create({
            data: {
                ...address,
                locations: {
                    create: files.map(file => ({ url: file.path }))
                }
            },
            include: {
                locations: true
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
        include: {
            locations: true
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

    const oldAddress = await prismaClient.address.findFirst({
        where: {
            id: address.id
        },
        include: {
            locations: true
        }
    });

    if (!oldAddress) {
        throw new ResponseError(404, "Address is not found");
    }

    if (files.length > 0) {
        oldAddress.locations.forEach(location => {
            if (fs.existsSync(location.url)) {
                fs.unlinkSync(location.url);
            }
        });
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
            locations: files.length > 0 ? {
                deleteMany: {},
                create: files.map(file => ({ url: file.path }))
            } : undefined
        },
        include: {
            locations: true
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

    const address = await prismaClient.address.findFirst({
        where: {
            id: addressId
        },
        include: {
            locations: true
        }
    });

    address.locations.forEach(location => {
        if (fs.existsSync(location.url)) {
            fs.unlinkSync(location.url);
        }
    });

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
        include: {
            locations: true
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