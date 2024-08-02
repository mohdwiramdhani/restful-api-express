import { validate } from "../validation/validation.js";
import {
    createContactValidation,
    getContactValidation,
    searchContactValidation,
    updateContactValidation
} from "../validation/contact-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import fs from "fs";

const create = async (user, request, files) => {
    const contact = validate(createContactValidation, request);
    contact.username = user.username;
    contact.photo = files.find(file => file.fieldname === 'photo')?.path || null;
    contact.certificate = files.find(file => file.fieldname === 'certificate')?.path || null;

    try {
        const newContact = await prismaClient.contact.create({
            data: contact,
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                photo: true,
                certificate: true
            }
        });

        return newContact;
    } catch (error) {
        throw error;
    }
};

const get = async (user, contactId) => {
    contactId = validate(getContactValidation, contactId);

    const contact = await prismaClient.contact.findFirst({
        where: {
            username: user.username,
            id: contactId
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            photo: true,
            certificate: true
        }
    });

    if (!contact) {
        throw new ResponseError(404, "contact is not found");
    }

    return contact;
}

const update = async (user, request, files) => {
    const contact = validate(updateContactValidation, request);

    const deleteFiles = (files) => {
        files.forEach(file => {
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    };

    const oldContact = await prismaClient.contact.findFirst({
        where: {
            username: user.username,
            id: contact.id
        },
        select: {
            photo: true,
            certificate: true
        }
    });

    if (!oldContact) {
        throw new ResponseError(404, "Contact not found");
    }

    const newPhoto = files.find(file => file.fieldname === 'photo')?.path;
    const newCertificate = files.find(file => file.fieldname === 'certificate')?.path;

    const filesToDelete = [];
    if (oldContact.photo && newPhoto && newPhoto !== oldContact.photo) {
        filesToDelete.push({ path: oldContact.photo });
    }
    if (oldContact.certificate && newCertificate && newCertificate !== oldContact.certificate) {
        filesToDelete.push({ path: oldContact.certificate });
    }

    if (filesToDelete.length > 0) {
        deleteFiles(filesToDelete);
    }

    contact.photo = newPhoto || oldContact.photo;
    contact.certificate = newCertificate || oldContact.certificate;

    try {
        const updatedContact = await prismaClient.contact.update({
            where: {
                id: contact.id
            },
            data: {
                first_name: contact.first_name,
                last_name: contact.last_name,
                email: contact.email,
                phone: contact.phone,
                photo: contact.photo,
                certificate: contact.certificate
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                photo: true,
                certificate: true
            }
        });

        return updatedContact;
    } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
    }
};

const remove = async (user, contactId) => {
    contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await prismaClient.contact.count({
        where: {
            username: user.username,
            id: contactId
        }
    });

    if (totalInDatabase !== 1) {
        throw new ResponseError(404, "contact is not found");
    }

    return prismaClient.contact.delete({
        where: {
            id: contactId
        }
    });
}

const search = async (user, request) => {
    request = validate(searchContactValidation, request);

    // 1 ((page - 1) * size) = 0
    // 2 ((page - 1) * size) = 10
    const skip = (request.page - 1) * request.size;

    const filters = [];

    filters.push({
        username: user.username
    })

    if (request.name) {
        filters.push({
            OR: [
                {
                    first_name: {
                        contains: request.name
                    }
                },
                {
                    last_name: {
                        contains: request.name
                    }
                }
            ]
        });
    }
    if (request.email) {
        filters.push({
            email: {
                contains: request.email
            }
        });
    }
    if (request.phone) {
        filters.push({
            phone: {
                contains: request.phone
            }
        });
    }

    const contacts = await prismaClient.contact.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip
    });

    const totalItems = await prismaClient.contact.count({
        where: {
            AND: filters
        }
    });

    return {
        data: contacts,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    create,
    get,
    update,
    remove,
    search
}