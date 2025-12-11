import { HiSecure } from "./core/HiSecure.js";
import { useSecure, secureRoute } from "./core/useSecure.js";

const hiSecure = HiSecure.getInstance();

export { 
    HiSecure,        
    hiSecure,        
    useSecure,       
    secureRoute      
};

export default hiSecure;



