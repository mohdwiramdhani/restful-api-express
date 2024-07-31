import { validate } from "../validation/validation.js";
import {
    createContactValidation,
    getContactValidation, searchContactValidation,
    updateContactValidation
} from "../validation/contact-validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { logger } from "../application/logging.js";
import fs from "fs";
import path from "path";

const ensureDirectoryExistence = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

const moveFiles = async (files) => {
    await Promise.all(files.map(async file => {
        let targetPath;
        switch (file.fieldname) {
            case 'profile_picture':
                targetPath = `public/images/profiles/${file.filename}`;
                break;
            case 'certificate':
                targetPath = `public/files/certificates/${file.filename}`;
                break;
            default:
                targetPath = `public/uploads/${file.filename}`;
        }

        ensureDirectoryExistence(path.dirname(targetPath));

        try {
            await fs.promises.rename(file.path, targetPath);
        } catch (error) {
            logger.error(`Error moving file ${file.path} to ${targetPath}:`, error);
            throw error;
        }
    }));
};

const create = async (user, request, files) => {
    const contact = validate(createContactValidation, request);
    contact.username = user.username;

    if (files.length > 0) {
        files.forEach(file => {
            switch (file.fieldname) {
                case 'profile_picture':
                    contact.profile_picture = `public/images/profiles/${file.filename}`;
                    break;
                case 'certificate':
                    contact.certificate = `public/files/certificates/${file.filename}`;
                    break;
                default:
                    break;
            }
        });
    }

    const result = await prismaClient.contact.create({
        data: contact,
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            profile_picture: true,
            certificate: true
        }
    });

    moveFiles(files);

    return result;
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
            profile_picture: true
        }
    });

    if (!contact) {
        throw new ResponseError(404, "contact is not found");
    }

    return contact;
}

const update = async (user, request, files) => {
    const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await prismaClient.contact.count({
        where: {
            username: user.username,
            id: contact.id
        }
    });

    if (totalContactInDatabase !== 1) {
        throw new ResponseError(404, "contact is not found");
    }

    const oldContact = await prismaClient.contact.findFirst({
        where: {
            id: contact.id
        },
        select: {
            profile_picture: true
        }
    });

    const updateData = {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
    };

    if (files.length > 0) {
        files.forEach(file => {
            if (file.fieldname === 'profile_picture') {
                updateData.profile_picture = `public/images/profiles/${file.filename}`;
            }
        });
    }

    const updatedContact = await prismaClient.contact.update({
        where: {
            id: contact.id
        },
        data: updateData,
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            profile_picture: true
        }
    });

    if (files.length > 0 && oldContact.profile_picture) {
        const oldFilePath = path.resolve(oldContact.profile_picture);
        logger.info('Deleting old file at:', oldFilePath);
        fs.unlink(oldFilePath, (err) => {
            if (err) {
                logger.error("Error deleting old profile picture:", err);
            }
        });
    }

    if (files.length > 0) {
        files.forEach(file => {
            if (file.fieldname === 'profile_picture') {
                const targetPath = path.resolve(`public/images/profiles/${file.filename}`);
                logger.info('Moving new file to:', targetPath);
                ensureDirectoryExistence(path.dirname(targetPath));
                try {
                    fs.renameSync(file.path, targetPath);
                } catch (error) {
                    logger.error(`Error moving file ${file.path} to ${targetPath}:`, error);
                }
            }
        });
    }

    return updatedContact;
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