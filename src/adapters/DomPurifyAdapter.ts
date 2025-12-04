import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { AdapterError } from "../core/errors/AdapterError";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

export class DomPurifyAdapter {
    sanitize(input: string): string {
        try {
            return DOMPurify.sanitize(input);
        } catch {
            throw new AdapterError("DOMPurify sanitizer failed.");
        }
    }

    middleware() {
        return (req: any, _res: any, next: any) => {
            try {
                if (req.body && typeof req.body === "object") {
                    for (const k of Object.keys(req.body)) {
                        if (typeof req.body[k] === "string") {
                            req.body[k] = this.sanitize(req.body[k]);
                        }
                    }
                }
                next();
            } catch (err) {
                next(err);
            }
        };
    }
}
