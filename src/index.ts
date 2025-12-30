import { HiSecure } from "./core/HiSecure.js";
import { useSecure, secureRoute } from "./core/useSecure.js";


export { z } from "zod";
export { body, query, param, header } from "express-validator"; // This is for route-level validation import 

const hiSecure = HiSecure.getInstance();

export { 
    HiSecure,        
    hiSecure,        
    useSecure,       
    secureRoute      
};

export default hiSecure;



