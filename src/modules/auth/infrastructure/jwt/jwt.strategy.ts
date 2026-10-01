import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy} from "passport-jwt";
import type { Request } from "express";
import { ACCESS_TOKEN_COOKIE } from "../../auth.constants.js";
import { getEnv } from "../../../../shared/env/get-env.js";
type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: (req: Request) => req?.cookies?.[ACCESS_TOKEN_COOKIE],
            secretOrKey: getEnv('JWT_ACCESS_SECRET'),
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }

}