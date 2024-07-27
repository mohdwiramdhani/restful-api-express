import {
    createManyTestContacts,
    createTestContact,
    createTestUser,
    getTestContact,
    removeAllTestContacts,
    removeTestUser,
    verifyTestToken
} from "./test-util.js";
import supertest from "supertest";
import { app } from "../src/application/app.js";
import { logger } from "../src/application/logging.js";

describe('POST /api/contacts', function () {
    beforeEach(async () => {
        await createTestUser();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can create new contact', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .post("/api/contacts")
            .set("Authorization", `Bearer ${token}`)
            .send({
                first_name: "Rama",
                last_name: "Dhani",
                email: "mohdwiramdhani@gmail.com",
                phone: "082208220822"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.first_name).toBe("Rama");
        expect(result.body.data.last_name).toBe("Dhani");
        expect(result.body.data.email).toBe("mohdwiramdhani@gmail.com");
        expect(result.body.data.phone).toBe("082208220822");
    });

    it('should reject if request is not valid', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .post("/api/contacts")
            .set("Authorization", `Bearer ${token}`)
            .send({
                first_name: "",
                last_name: "Dhani",
                email: "test",
                phone: "1234567890987654321234567890"
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/contacts/:contactId', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestContact();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can get contact', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const testContact = await getTestContact();

        const result = await supertest(app)
            .get("/api/contacts/" + (testContact.id))
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(testContact.id);
        expect(result.body.data.first_name).toBe(testContact.first_name);
        expect(result.body.data.last_name).toBe(testContact.last_name);
        expect(result.body.data.email).toBe(testContact.email);
        expect(result.body.data.phone).toBe(testContact.phone);
    });

    it('should return 404 if contact id is not found', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const testContact = await getTestContact();

        const result = await supertest(app)
            .get("/api/contacts/" + (testContact.id + 1))
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(404);
    });
});

describe('PUT /api/contacts/:contactId', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestContact();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can update existing contact', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const testContact = await getTestContact();

        const result = await supertest(app)
            .put('/api/contacts/' + testContact.id)
            .set("Authorization", `Bearer ${token}`)
            .send({
                first_name: "Dwi",
                last_name: "Ramdhani",
                email: "dwiramdhani@gmail.com",
                phone: "085200000000"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(testContact.id);
        expect(result.body.data.first_name).toBe("Dwi");
        expect(result.body.data.last_name).toBe("Ramdhani");
        expect(result.body.data.email).toBe("dwiramdhani@gmail.com");
        expect(result.body.data.phone).toBe("085200000000");
    });

    it('should reject if request is invalid', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const testContact = await getTestContact();

        const result = await supertest(app)
            .put('/api/contacts/' + testContact.id)
            .set("Authorization", `Bearer ${token}`)
            .send({
                first_name: "",
                last_name: "",
                email: "mail",
                phone: ""
            });

        expect(result.status).toBe(400);
    });

    it('should reject if contact is not found', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const testContact = await getTestContact();

        const result = await supertest(app)
            .put('/api/contacts/' + (testContact.id + 1))
            .set("Authorization", `Bearer ${token}`)
            .send({
                first_name: "Dwi",
                last_name: "Ramdhani",
                email: "dwiramdhani@gmail.com",
                phone: "085200000000"
            });

        expect(result.status).toBe(404);
    });
});

describe('DELETE /api/contacts/:contactId', function () {
    beforeEach(async () => {
        await createTestUser();
        await createTestContact();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can delete contact', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        let testContact = await getTestContact();
        const result = await supertest(app)
            .delete('/api/contacts/' + testContact.id)
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(200);
        expect(result.body.data).toBe("OK");

        testContact = await getTestContact();
        expect(testContact).toBeNull();
    });

    it('should reject if contact is not found', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        let testContact = await getTestContact();
        const result = await supertest(app)
            .delete('/api/contacts/' + (testContact.id + 1))
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(404);
    });
});

describe('GET /api/contacts', function () {
    beforeEach(async () => {
        await createTestUser();
        await createManyTestContacts();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can search without parameter', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/contacts')
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should can search to page 2', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/contacts')
            .query({
                page: 2
            })
            .set("Authorization", `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(5);
        expect(result.body.paging.page).toBe(2);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should can search using name', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/contacts')
            .query({
                name: "Dhani 1"
            })
            .set("Authorization", `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(6);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(6);
    });

    it('should can search using email', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/contacts')
            .query({
                email: "mohdwiramdhani1"
            })
            .set("Authorization", `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(6);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(6);
    });

    it('should can search using phone', async () => {
        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/contacts')
            .query({
                phone: "08229606481"
            })
            .set("Authorization", `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(6);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(6);
    });
});