import server from "./index";
const request = require("supertest");

import {hashPassword} from "./utils/hashing-actions";

describe("API", () => {
    it("POST /api/auth/sign-in -> 400", () => {
        return request(server).post("/api/auth/sign-in").send({
            email: "warathep187",
            password: "12345678"
        }).then(() => {
            expect(400);
        })
    })
})

describe("UNIT TESTING", () => {
    it("Check hashPassword() -> string", () => {
        const password = "1234567890";
        hashPassword(password).then((response) => {
            expect(typeof response).toEqual("string");
        })
    })
})