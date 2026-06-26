"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../shared/utils/apiResponse");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = (await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            }));
            // Replace request parts with typed and sanitized validated data
            req.body = parsed.body;
            if (parsed.query) {
                for (const key in req.query) {
                    delete req.query[key];
                }
                Object.assign(req.query, parsed.query);
            }
            if (parsed.params) {
                for (const key in req.params) {
                    delete req.params[key];
                }
                Object.assign(req.params, parsed.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.issues.map((err) => ({
                    field: err.path.join('.').replace(/^(body|query|params)\./, ''),
                    message: err.message,
                }));
                return (0, apiResponse_1.sendValidationError)(res, details);
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.middleware.js.map