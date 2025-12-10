// export function deepFreeze<T>(obj: T): T {
//     // Freeze the top level object
//     Object.freeze(obj);

//     // Now recursively freeze nested objects
//     Object.getOwnPropertyNames(obj).forEach((prop) => {
//         // @ts-ignore
//         const value = obj[prop];

//         if (
//             value &&
//             (typeof value === "object" || typeof value === "function") &&
//             !Object.isFrozen(value)
//         ) {
//             deepFreeze(value); // recursive freeze
//         }
//     });

//     return obj;
// }




export function deepFreeze<T>(obj: T, visited = new WeakSet()): T {
    // Handle primitives and null/undefined
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object' && typeof obj !== 'function') return obj;
    
    // Handle circular references
    if (visited.has(obj)) return obj;
    visited.add(obj);
    
    // Don't freeze built-in objects that shouldn't be frozen
    const constructor = obj.constructor;
    const builtIns = [Date, RegExp, Map, Set, WeakMap, WeakSet, Promise];
    if (builtIns.some(builtIn => obj instanceof builtIn)) {
        return obj;
    }
    
    // Don't freeze functions
    if (typeof obj === 'function') return obj;
    
    // Freeze the object itself
    Object.freeze(obj);
    
    // Freeze array elements
    if (Array.isArray(obj)) {
        for (const item of obj) {
            if (item && typeof item === 'object') {
                deepFreeze(item, visited);
            }
        }
        return obj;
    }
    
    // Freeze object properties
    const props = Object.getOwnPropertyNames(obj);
    for (const prop of props) {
        const value = (obj as any)[prop];
        if (value && typeof value === 'object') {
            deepFreeze(value, visited);
        }
    }
    
    // Freeze symbol properties
    const symbols = Object.getOwnPropertySymbols(obj);
    for (const sym of symbols) {
        const value = (obj as any)[sym];
        if (value && typeof value === 'object') {
            deepFreeze(value, visited);
        }
    }
    
    return obj;
}