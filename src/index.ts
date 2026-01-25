// import { HiSecure } from "./core/HiSecure.js";
// import { useSecure, secureRoute } from "./core/useSecure.js";


// export { z } from "zod";
// export { body, query, param, header } from "express-validator";

// const hiSecure = HiSecure.getInstance();

// export { 
//     HiSecure,        
//     hiSecure,        
//     useSecure,       
//     secureRoute      
// };

// export default hiSecure;




import { HiSecure } from "./core/HiSecure.js";
import { useSecure, secureRoute } from "./core/useSecure.js";

export { z } from "zod";
export { body, query, param, header } from "express-validator";


export {
  HiSecure,
  useSecure,
  secureRoute
};

