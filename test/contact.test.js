import {
    createTestUser,
    removeAllTestContacts,
    removeTestUser
} from "./test-util.js";
import supertest from "supertest";
import { web } from "../src/application/web.js";

describe('POST /api/contacts', function () {
    beforeEach(async () => {
        await createTestUser();
    })

    afterEach(async () => {
        await removeAllTestContacts();
        await removeTestUser();
    })

    it('should can create new contact', async () => {
        const result = await supertest(web)
            .post("/api/contacts")
            .set('Authorization', 'test')
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
        const result = await supertest(web)
            .post("/api/contacts")
            .set('Authorization', 'test')
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