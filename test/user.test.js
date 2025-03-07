import supertest from "supertest";
import { app } from "../src/application/app.js";
import { logger } from "../src/application/logging.js";
import { createTestUser, removeTestUser, getTestUser, verifyTestToken } from "./test-util.js";
import bcrypt from "bcrypt";

describe('POST /api/users', function () {

    afterEach(async () => {
        await removeTestUser();
    })

    it('should can register new user', async () => {
        const result = await supertest(app)
            .post('/api/users')
            .send({
                username: 'dhani',
                password: 'pw',
                name: 'dhani'
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("dhani");
        expect(result.body.data.name).toBe("dhani");
        expect(result.body.data.password).toBeUndefined();
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(app)
            .post('/api/users')
            .send({
                username: '',
                password: '',
                name: ''
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if username already registered', async () => {
        let result = await supertest(app)
            .post('/api/users')
            .send({
                username: 'dhani',
                password: 'pw',
                name: 'dhani'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("dhani");
        expect(result.body.data.name).toBe("dhani");
        expect(result.body.data.password).toBeUndefined();

        result = await supertest(app)
            .post('/api/users')
            .send({
                username: 'dhani',
                password: 'pw',
                name: 'dhani'
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });
});

describe('POST /api/users/login', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can login', async () => {
        const result = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();

        const decoded = verifyTestToken(result.body.data.token);
        expect(decoded.username).toBe("dhani");
    });

    it('should reject login if request is invalid', async () => {
        const result = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "",
                password: ""
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if password is wrong', async () => {
        const result = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if username is wrong', async () => {
        const result = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "salah",
                password: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

});

describe('GET /api/users/current', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can get current user', async () => {

        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });

        const token = loginResult.body.data.token;

        const result = await supertest(app)
            .get('/api/users/current')
            .set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe('dhani');
        expect(result.body.data.name).toBe('dhani');
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(app)
            .get('/api/users/current')
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('PATCH /api/users/current', function () {
    let token;

    beforeEach(async () => {
        await createTestUser();

        const loginResult = await supertest(app)
            .post('/api/users/login')
            .send({
                username: "dhani",
                password: "pw"
            });
        token = loginResult.body.data.token;
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can update user all attributes', async () => {

        const result = await supertest(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "rama",
                password: "pwpw"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("dhani");
        expect(result.body.data.name).toBe("rama");

        const user = await getTestUser();
        expect(await bcrypt.compare("pwpw", user.password)).toBe(true);
    });

    it('should can update user name', async () => {

        const result = await supertest(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "rama"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("dhani");
        expect(result.body.data.name).toBe("rama");
    });

    it('should can update user password', async () => {
        const result = await supertest(app)
            .patch("/api/users/current")
            .set("Authorization", `Bearer ${token}`)
            .send({
                password: "pwpw"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe("dhani");
        expect(result.body.data.name).toBe("dhani");

        const user = await getTestUser();
        expect(await bcrypt.compare("pwpw", user.password)).toBe(true);
    });

    it('should reject if request is not valid', async () => {
        const result = await supertest(app)
            .patch("/api/users/current")
            .set("Authorization", "salah")
            .send({});

        expect(result.status).toBe(401);
    });
});