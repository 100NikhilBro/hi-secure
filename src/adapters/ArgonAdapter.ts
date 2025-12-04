import argon2 from "argon2";
import { AdapterError } from "../core/errors/AdapterError";

export class ArgonAdapter {
    async hash(value: string): Promise<string> {
        try {
            return await argon2.hash(value);
        } catch (err) {
            throw new AdapterError("Argon2 hashing failed.");
        }
    }

    async verify(value: string, hashed: string): Promise<boolean> {
        try {
            return await argon2.verify(hashed, value);
        } catch (err) {
            throw new AdapterError("Argon2 verify failed.");
        }
    }
}
