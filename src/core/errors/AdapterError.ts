import {ERROR_CODES} from '../constants'

export class AdapterError extends Error {

    code:string;

    constructor(message:string,code:string=ERROR_CODES.ADAPTER_FAILURE){
        super(message);
        this.code = code;
        this.name = 'AdapterError'
    }

}