"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const env_1 = require("./env");
const user_model_1 = require("../modules/auth/user.model");
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env_1.env.JWT_SECRET,
};
passport_1.default.use(new passport_jwt_1.Strategy(options, async (jwtPayload, done) => {
    try {
        const user = await user_model_1.User.findById(jwtPayload.id);
        if (user) {
            if (user.status !== 'active') {
                return done(null, false, { message: 'User is inactive' });
            }
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map