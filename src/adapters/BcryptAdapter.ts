import bcrypt from "bcryptjs";
import { AdapterError } from "../core/errors/AdapterError";

export class BcryptAdapter {
    constructor(private saltRounds: number = 10) {}

    async hash(value: string): Promise<string> {
        try {
            return await bcrypt.hash(value, this.saltRounds);
        } catch (err) {
            throw new AdapterError("Bcrypt hashing failed.");
        }
    }

    async verify(value: string, hashed: string): Promise<boolean> {
        try {
            return await bcrypt.compare(value, hashed);
        } catch (err) {
            throw new AdapterError("Bcrypt verify failed.");
        }
    }
}
