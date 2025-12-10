// export function deepMerge<T>(target: T, source: Partial<T>): T {
//   if (!source) return target;

//   const output: any = Array.isArray(target) ? [...(target as any)] : { ...(target as any) };

//   for (const key of Object.keys(source) as Array<keyof typeof source>) {
//     const sourceValue = (source as any)[key];
//     const targetValue = (target as any)[key];

//     const shouldRecurse =
//       sourceValue &&
//       typeof sourceValue === "object" &&
//       !Array.isArray(sourceValue) &&
//       targetValue &&
//       typeof targetValue === "object";

//     if (shouldRecurse) {
//       output[key] = deepMerge(targetValue, sourceValue);
//     } else {
//       output[key] = sourceValue;
//     }
//   }

//   return output;
// }




export function deepMerge<T extends object, U extends Partial<T>>(
    target: T,
    source: U,
    options: { mergeArrays?: boolean; skipUndefined?: boolean } = {}
): T & U {
    const { mergeArrays = false, skipUndefined = true } = options;
    
    if (!source || typeof source !== 'object') {
        return target as T & U;
    }
    
    const output: any = Array.isArray(target) 
        ? [...target] 
        : { ...target };
    
    for (const key in source) {
        if (!source.hasOwnProperty(key)) continue;
        
        const sourceValue = (source as any)[key];
        const targetValue = (target as any)[key];
        
        // Skip undefined values if configured
        if (skipUndefined && sourceValue === undefined) continue;
        
        // Handle null explicitly
        if (sourceValue === null) {
            output[key] = null;
            continue;
        }
        
        // Merge arrays if option enabled
        if (mergeArrays && Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            output[key] = [...targetValue, ...sourceValue];
            continue;
        }
        
        // Recursive merge for plain objects
        if (sourceValue && typeof sourceValue === 'object' &&
            targetValue && typeof targetValue === 'object' &&
            !Array.isArray(sourceValue) && !Array.isArray(targetValue) &&
            sourceValue.constructor === Object && targetValue.constructor === Object) {
            
            output[key] = deepMerge(targetValue, sourceValue, options);
            continue;
        }
        
        // Overwrite for everything else
        output[key] = sourceValue;
    }
    
    // Handle symbol properties
    const symbols = Object.getOwnPropertySymbols(source);
    for (const sym of symbols) {
        output[sym] = (source as any)[sym];
    }
    
    return output as T & U;
}