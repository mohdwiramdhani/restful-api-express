import { prismaClient } from "../src/application/database.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = 'secret_key';

export const verifyTestToken = (token) => {
    return jwt.verify(token, JWT_SECRET_KEY);
};

export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            username: "dhani"
        }
    })
}

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            username: "dhani",
            password: await bcrypt.hash("pw", 10),
            name: "dhani"
        }
    })
}

export const getTestUser = async () => {
    return prismaClient.user.findUnique({
        where: {
            username: "dhani"
        }
    });
}

export const removeAllTestContacts = async () => {
    await prismaClient.contact.deleteMany({
        where: {
            username: 'dhani'
        }
    });
}

export const createTestContact = async () => {
    await prismaClient.contact.create({
        data: {
            username: "dhani",
            first_name: "Rama",
            last_name: "Dhani",
            email: "mohdwiramdhani@gmail.com",
            phone: "082208220822"
        }
    })
}

export const createManyTestContacts = async () => {
    for (let i = 0; i < 15; i++) {
        await prismaClient.contact.create({
            data: {
                username: `dhani`,
                first_name: `Rama ${i}`,
                last_name: `Dhani ${i}`,
                email: `mohdwiramdhani${i}@gmail.com`,
                phone: `0822960648${i}`
            }
        })
    }
}

export const getTestContact = async () => {
    return prismaClient.contact.findFirst({
        where: {
            username: 'dhani'
        }
    })
}

export const removeAllTestAddresses = async () => {
    await prismaClient.address.deleteMany({
        where: {
            contact: {
                username: "dhani"
            }
        }
    });
}

export const createTestAddress = async () => {
    const contact = await getTestContact();
    await prismaClient.address.create({
        data: {
            contact_id: contact.id,
            street: "jalan test",
            city: 'kota test',
            province: 'provinsi test',
            country: 'indonesia',
            postal_code: '24514'
        }
    })
}

export const getTestAddress = async () => {
    return prismaClient.address.findFirst({
        where: {
            contact: {
                username: "dhani"
            }
        }
    })
}