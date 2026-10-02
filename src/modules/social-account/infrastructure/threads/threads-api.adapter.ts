import { Injectable } from "@nestjs/common";
import type { ISocialApiPort } from "../../application/ports/socia-account-api.port.js";

@Injectable()
export class ThreadsApiAdapter implements ISocialApiPort {
    constructor() {}
}