
/**
 * Retrieve a value from an object using a string path (dot notation).
 * Supports array indexing e.g. "users[0].name" or "users.0.name".
 */
export function getValueByPath(obj: any, path: string): any {
    if (obj == null || !path) return undefined;
    
    // Normalize path: "a[0].b" -> "a.0.b"
    const normalizedPath = path.replace(/\[(\w+)\]/g, ".$1");
    const parts = normalizedPath.split(".");
    
    let current = obj;
    for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
    }
    
    return current;
}

/**
 * Set a value on an object using a string path (dot notation).
 * Creates nested objects/arrays if they don't exist.
 */
export function setValueByPath(obj: any, path: string, value: any): void {
    if (obj == null || !path) return;
    
    const normalizedPath = path.replace(/\[(\w+)\]/g, ".$1");
    const parts = normalizedPath.split(".");
    
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        
        // If the property doesn't exist, create it.
        // Look ahead to decide if we need an array or an object.
        if (current[part] == null) {
            const nextPart = parts[i + 1];
            // If next part is an integer, assume array.
            const isNextIndex = !isNaN(parseInt(nextPart)) && isFinite(parseInt(nextPart));
            current[part] = isNextIndex ? [] : {};
        }
        
        current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
}
