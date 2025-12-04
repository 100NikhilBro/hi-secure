import {ERROR_CODES} from '../constants'

export class SecurityError extends Error{
    code:string;

    constructor(message:string,code:string=ERROR_CODES.UNKNOWN){
        super(message);
        this.code = code;
        this.name = "SecurityError";
    }
}

