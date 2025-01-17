import { getMapFieldMetadataList } from "./field.decorator";

/**
* Convert the instance of this class to JSON Object.
*  
* @returns JSON object mapped considering metadata "src" and "reverser"
*/
export function toMap(): any {
    const metadataList: any = getMapFieldMetadataList(this);
    let obj = {};

    const processProperty = (objCopy: any, propsStereoid: any[], value: any, reverser: any) => {
        let lastIndex: string;
        for (let i = 0; i < propsStereoid.length; i++) {
            const prop = propsStereoid[i];
            if (prop.isArray) {
                let arrIndex = prop.arrIndex.split(/\[(\w+)\]/g).filter(index => index !== '');
                objCopy[prop.prop] = objCopy[prop.prop] || [];
                objCopy = objCopy[prop.prop];
                arrIndex.forEach((index, i) => {
                    objCopy[index] = objCopy[index] || (i == arrIndex.length - 1 ? {} : []);
                    if (i != arrIndex.length - 1) objCopy = objCopy[index];
                    else lastIndex = index;
                });
            } else {
                objCopy[prop.prop] = objCopy[prop.prop] || {};
                if (i != propsStereoid.length - 1) objCopy = objCopy[prop.prop];
                else lastIndex = prop.prop;
            }
        }
        objCopy[lastIndex] = reverser ? reverser(value, this) : value;
    };

    this && Object.keys(this).forEach(propertyName => {
        const metadata = metadataList && metadataList[propertyName];
        const src = metadata?.src || propertyName;

        if (metadata) {
            if (src.includes('.')) {
                let props = src.split('.');
                let propsStereoid = props.map(prop => ({
                    prop: prop.includes('[') ? prop.substring(0, prop.indexOf('[')) : prop,
                    isArray: prop.includes('[') && prop.includes(']'),
                    arrIndex: prop.substring(prop.indexOf('[')),
                }));
                processProperty(obj, propsStereoid, this[propertyName], metadata.reverser);
            } else {
                obj[src] = Array.isArray(this[propertyName]) && !metadata.reverser
                    ? this[propertyName].map(item => item?.toMap ? item.toMap() : item)
                    : metadata.reverser
                        ? metadata.reverser(this[propertyName], this)
                        : this[propertyName]?.toMap
                            ? this[propertyName].toMap()
                            : this[propertyName];
            }
        } else {
            if (this[propertyName] != undefined)
                obj[propertyName] = this[propertyName];
        }
    });

    return obj;
}

/**
 * Convert a JSON Object to an instance of this class.
 * 
 * @param obj JSON Object 
 * @returns Instance of this class
 */
export function objToModel(obj: Object) {
    if (!obj) return this;

    Object.keys(obj).forEach(propertyName => {
        const value = obj[propertyName];

        this[propertyName] = Array.isArray(value)
            ? value.map(item => item)
            : value;
    });

    return this;
}

/**
 * Check if this instance is empty.
 * 
 * @returns true or false
 */
export function empty(): boolean {
    return !Object.keys(this).some(propertyName => this[propertyName] !== undefined && this[propertyName] !== null);
}

/**
 * Check if this instance is filled.
 * 
 * @returns true or false
 */
export function filled(): boolean {
    return Object.keys(this).length > 0 && Object.keys(this).every(propertyName => this[propertyName] !== undefined && this[propertyName] !== null);
}

/**
 * GET property value from a string path.
 * 
 * @param path String path
 * @returns Value of the property
 */
export function get<T>(path: string): T {
    const props = path.replace(/\[(\w+)\]/g, '.$1').split('.');
    return props.reduce((acc, prop) => acc && acc[prop], this) as T;
}

/**
 * SET property value from a string path.
 * 
 * @param path String path
 * @param value Value of the property
 */
export function set(path: string, value: any) {
    const props = path.replace(/\[(\w+)\]/g, '.$1').split('.');
    let obj = this;

    props.slice(0, -1).forEach(prop => {
        if (!obj[prop]) obj[prop] = {};
        obj = obj[prop];
    });

    obj[props[props.length - 1]] = value;
}

/**
 * Deep copy of the object caller
 */
export function copy<T>(): T {
    return this.from(this.toMap());
}

/**
 * Constructor of the mapper.
 * 
 * @param object object to be mapped considering metadata "src", "transformer" and "reverser"
 */
export function from(object: any) {
    const metadataList: any = getMapFieldMetadataList(this);

    const processProperty = (objCopy: any, propsStereoid: any[]) => {
        for (let i = 0; i < propsStereoid.length; i++) {
            const prop = propsStereoid[i];
            if (prop.isArray) {
                let arrIndex = prop.arrIndex.split(/\[(\w+)\]/g).filter(index => index !== '');
                objCopy = objCopy[prop.prop];
                arrIndex.forEach(index => {
                    objCopy = objCopy[index];
                });
            } else {
                objCopy = objCopy[prop.prop];
            }
        }
        return objCopy;
    };

    const setProperty = (metaKey: string, value: any, object: any) => {
        const metaProp = metadataList?.[metaKey];
        if (metaProp?.transformer) {
            const valueTransformed = metaProp.transformer(value, object);
            if (valueTransformed != undefined)
                this[metaKey] = valueTransformed;
        } else {
            if (value != undefined)
                this[metaKey] = value;
        }
    };

    object && Object.keys(object).forEach(propertyName => {
        let metaKeys = metadataList && Object.keys(metadataList).filter(metadata => metadataList[metadata]?.src?.split('.')?.includes(propertyName));
        if (metaKeys?.length) {
            metaKeys.forEach(metaKey => {
                const metaProp = metadataList?.[metaKey];
                if (metaProp) {
                    const props = metaProp.src.split('.');
                    const propsStereoid = props.map(prop => ({
                        prop: prop.includes('[') ? prop.substring(0, prop.indexOf('[')) : prop,
                        isArray: prop.includes('[') && prop.includes(']'),
                        arrIndex: prop.substring(prop.indexOf('[')),
                    }));
                    const value = processProperty({ ...object }, propsStereoid);
                    setProperty(metaKey, value, object);
                }
            });
        } else {
            let metaKey = metadataList && Object.keys(metadataList).find(metadata => metadataList[metadata]?.src == propertyName);
            if (metaKey) {
                const src = metadataList?.[metaKey].src || propertyName;
                setProperty(metaKey, object[src], object);
            } else {
                setProperty(propertyName, object[propertyName], object);
            }
        }
    });

    // Initialize properties with "initialize" metadata
    metadataList && Object.keys(metadataList).forEach(metaName => {
        if (metadataList[metaName]?.initialize && metadataList[metaName]?.transformer && this[metaName] === undefined) {
            this[metaName] = metadataList[metaName].transformer(null, object);
        }
    });

    return this;
}
