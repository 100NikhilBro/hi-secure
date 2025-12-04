import sanitizeHtml from 'sanitize-html'
import { AdapterError } from "../core/errors/AdapterError";

export class SanitizeHtmlAdapter {
  private options: any;
  constructor(options: any = {}) {
    this.options = options;
  }

  sanitize(input: string): string {
    try {
      return sanitizeHtml(input, this.options);
    } catch (err) {
      throw new AdapterError("sanitize-html adapter failed.");
    }
  }

  // middleware helper for express
  middleware() {
    return (req: any, _res: any, next: any) => {
      try {
        // sanitize body (simple strategy: loop string fields) — refine later
        if (req.body && typeof req.body === "object") {
          for (const k of Object.keys(req.body)) {
            if (typeof req.body[k] === "string") {
              req.body[k] = this.sanitize(req.body[k]);
            }
          }
        }
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}
