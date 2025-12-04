export function deepFreeze<T>(obj: T): T {
    // Freeze the top level object
    Object.freeze(obj);

    // Now recursively freeze nested objects
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        // @ts-ignore
        const value = obj[prop];

        if (
            value &&
            (typeof value === "object" || typeof value === "function") &&
            !Object.isFrozen(value)
        ) {
            deepFreeze(value); // recursive freeze
        }
    });

    return obj;
}
