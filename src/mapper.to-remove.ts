import { getMapFieldMetadataList } from "./field.decorator";
import { ClassType } from "./types";

interface PropStereoid {
    prop: string;
    isArray: boolean;
    arrIndex: string;
}

export class MapperFactory {
    /**
     * Constructor of the mapper.
     * 
     * @param object object to be mapped considering metadata "src", "transformer" and "reverser"
     */
    constructor(object?: any) {
        const metadataList: any = getMapFieldMetadataList(this);

        if (object) {
            this.mapObject(object, metadataList);
        }

        this.initializeProperties(metadataList, object);

        console.log('Final state of this in MapperFactory:', this);
    }

    /**
     * Maps the properties of an object based on the provided metadata list.
     * 
     * @param object - The object whose properties need to be mapped.
     * @param metadataList - The list of metadata used to map the object's properties.
     * 
     * This method iterates over each property of the given object. For each property, it retrieves the corresponding metadata keys.
     * If metadata keys are found, it maps the property using the `mapProperty` method for each metadata key.
     * If no metadata keys are found, it maps the property directly using the `mapDirectProperty` method.
     */
    private mapObject(object: any, metadataList: any) {
        Object.keys(object).forEach(propertyName => {
            const metaKeys = this.getMetaKeys(metadataList, propertyName);

            if (metaKeys.length) {
                metaKeys.forEach(metaKey => {
                    this.mapProperty(object, metadataList, propertyName, metaKey);
                });
            } else {
                this.mapDirectProperty(object, metadataList, propertyName);
            }
        });
    }

    /**
     * Retrieves the metadata keys associated with a given property name.
     *
     * @param metadataList - The list of metadata objects to search through.
     * @param propertyName - The name of the property to find metadata keys for.
     * @returns An array of metadata keys that are associated with the specified property name.
     */
    private getMetaKeys(metadataList: any, propertyName: string): string[] {
        return metadataList ? Object.keys(metadataList).filter(metadata => metadataList[metadata]?.src?.split('.')?.includes(propertyName)) : [];
    }

    /**
     * Maps a property from the given object to the current instance based on the provided metadata.
     *
     * @param object - The source object containing the property to be mapped.
     * @param metadataList - A list of metadata that provides mapping information.
     * @param propertyName - The name of the property to be mapped.
     * @param metaKey - The key used to retrieve the specific metadata for the property.
     *
     * This method performs the following steps:
     * 1. Retrieves the metadata for the given metaKey.
     * 2. If metadata exists, it gets the properties' stereoid and creates a copy of the object.
     * 3. Iterates over the properties' stereoid and updates the object copy.
     * 4. If a transformer function is defined in the metadata, it applies the transformer to the object copy and the original object.
     * 5. If no metadata exists for the metaKey, it maps the property directly using the `mapDirectProperty` method.
     */
    private mapProperty(object: any, metadataList: any, propertyName: string, metaKey: string) {
        const metaProp = metadataList[metaKey];

        if (metaProp) {
            const propsStereoid = this.getPropsStereoid(metaProp.src);
            let objCopy = { ...object };

            propsStereoid.forEach(prop => {
                objCopy = this.getObjectCopy(objCopy, prop);
            });

            this[metaKey] = metaProp.transformer ? metaProp.transformer(objCopy, object) : objCopy;
        } else {
            this.mapDirectProperty(object, metadataList, propertyName);
        }
    }

    /**
     * Parses a dot-separated string and returns an array of PropStereoid objects.
     * Each PropStereoid object contains information about the property name,
     * whether it is an array, and the array index if applicable.
     *
     * @param src - The dot-separated string to parse.
     * @returns An array of PropStereoid objects.
     */
    private getPropsStereoid(src: string): PropStereoid[] {
        return src.split('.').map(prop => {
            const index = prop.indexOf('[');
            return {
                prop: index > 0 ? prop.substring(0, index) : prop,
                isArray: prop.includes('[') && prop.includes(']'),
                arrIndex: prop.substring(index),
            };
        });
    }

    /**
     * Retrieves a copy of an object property based on the provided `PropStereoid`.
     * 
     * @param objCopy - The object from which the property copy is to be retrieved.
     * @param prop - The `PropStereoid` object containing property details.
     * @returns A copy of the specified property from the object.
     * 
     * @remarks
     * If the property is an array, the method navigates through the array indices
     * specified in `prop.arrIndex` to retrieve the nested property.
     * Otherwise, it directly retrieves the property specified in `prop.prop`.
     * 
     * @example
     * ```typescript
     * const obj = { a: { b: [ { c: 1 }, { c: 2 } ] } };
     * const prop = { isArray: true, arrIndex: '[1]', prop: 'b' };
     * const result = getObjectCopy(obj, prop);
     * console.log(result); // Output: { c: 2 }
     * ```
     */
    private getObjectCopy(objCopy: any, prop: PropStereoid): any {
        if (prop.isArray) {
            const arrIndex = prop.arrIndex.split(/\[(\w+)\]/g).filter(index => index !== '');
            objCopy = objCopy[prop.prop];
            arrIndex.forEach(index => {
                objCopy = objCopy[index];
            });
        } else {
            objCopy = objCopy[prop.prop];
        }
        return objCopy;
    }

    /**
     * Maps a direct property from the given object to the current instance based on the provided metadata list.
     * 
     * @param object - The source object containing the properties to be mapped.
     * @param metadataList - An optional list of metadata that defines how properties should be mapped and transformed.
     * @param propertyName - The name of the property to be mapped from the source object.
     * 
     * The method performs the following steps:
     * 1. Checks if the metadata list contains a key that matches the source property name.
     * 2. If a matching metadata key is found, it uses the metadata to determine the source property name (`src`) and applies any defined transformer function.
     * 3. If no matching metadata key is found, it directly maps the property from the source object, applying any transformer function if defined.
     */
    private mapDirectProperty(object: any, metadataList: any, propertyName: string) {
        const metaKey = metadataList ? Object.keys(metadataList).find(metadata => metadataList[metadata]?.src === propertyName) : null;

        if (metaKey) {
            const src = metadataList[metaKey].src || propertyName;
            this[metaKey] = metadataList[metaKey].transformer ? metadataList[metaKey].transformer(object[src], object) : object[src];
        } else {
            this[propertyName] = (metadataList && metadataList[propertyName]?.transformer) ? metadataList[propertyName].transformer(object[propertyName], object) : object[propertyName];
        }
    }

    /**
     * Initializes properties of the current object based on the provided metadata list.
     *
     * @param metadataList - An object containing metadata information for properties.
     * @param object - The object to be used for initializing properties.
     *
     * The method iterates over the keys of the metadataList. For each key, if the corresponding metadata
     * has an `initialize` property set to true, a `transformer` function, and the current object does not
     * already have a property with the same name, it initializes the property using the transformer function.
     */
    private initializeProperties(metadataList: any, object: any) {
        if (metadataList) {
            Object.keys(metadataList).forEach(metaName => {
                if (metadataList[metaName]?.initialize && metadataList[metaName]?.transformer && this[metaName] === undefined) {
                    this[metaName] = metadataList[metaName]?.transformer(null, object);
                }
            });
        }
    }

    /**
     * Converts the current object instance to a mapped object.
     * 
     * This method iterates over the properties of the current object and maps them
     * according to the metadata provided by `getMapFieldMetadataList`. If a property
     * has associated metadata, it uses the `mapToJson` method to map it. Otherwise,
     * it directly assigns the property value to the resulting object, applying a 
     * reverser function if specified in the metadata.
     * 
     * @returns {any} The mapped object.
     */
    toMap(): any {
        const metadataList: any = getMapFieldMetadataList(this);
        const obj = {};

        Object.keys(this).forEach(propertyName => {
            if (metadataList && metadataList[propertyName]) {
                this.mapToJson(metadataList, obj, propertyName);
            } else {
                obj[propertyName] = metadataList && metadataList[propertyName]?.reverser ? metadataList[propertyName].reverser(this[propertyName], this) : this[propertyName];
            }

            if (!obj[propertyName]) {
                delete obj[propertyName];
            }
        });


        return obj;
    }

    /**
     * Maps the provided object to a JSON structure based on the given metadata list.
     *
     * @param metadataList - An object containing metadata information for mapping.
     * @param obj - The object to be mapped to JSON.
     * @param propertyName - The name of the property to be mapped.
     *
     * The method supports nested properties and arrays. If the source property name
     * (src) contains dots, it indicates nested properties. The method will traverse
     * the object structure accordingly and create nested objects or arrays as needed.
     *
     * The `getPropsStereoid` method is used to parse the nested property names and
     * determine if they are arrays. The `getReversedValue` method is used to get the
     * value to be assigned to the final property.
     *
     * Example:
     * ```
     * const metadataList = {
     *   'nested.property': { src: 'nested.property' },
     *   'array[0].item': { src: 'array[0].item' }
     * };
     * const obj = {};
     * mapToJson(metadataList, obj, 'nested.property');
     * mapToJson(metadataList, obj, 'array[0].item');
     * ```
     * The resulting `obj` will have the structure:
     * ```
     * {
     *   nested: {
     *     property: <value>
     *   },
     *   array: [
     *     { item: <value> }
     *   ]
     * }
     * ```
     */
    private mapToJson(metadataList: any, obj: any, propertyName: string) {
        const src = metadataList[propertyName].src || propertyName;

        if (src.includes('.')) {
            const propsStereoid = this.getPropsStereoid(src);
            let objCopy = obj;
            let lastIndex: string;

            propsStereoid.forEach((prop, i) => {
                if (prop.isArray) {
                    const arrIndex = prop.arrIndex.split(/\[(\w+)\]/g).filter(index => index !== '');
                    objCopy[prop.prop] = objCopy[prop.prop] || [];
                    objCopy = objCopy[prop.prop];

                    arrIndex.forEach((index, j) => {
                        objCopy[index] = objCopy[index] || (j === arrIndex.length - 1 ? {} : []);
                        if (j !== propsStereoid.length - 1) {
                            objCopy = objCopy[index];
                        } else {
                            lastIndex = index;
                        }
                    });
                } else {
                    objCopy[prop.prop] = objCopy[prop.prop] || {};
                    if (i !== propsStereoid.length - 1) {
                        objCopy = objCopy[prop.prop];
                    } else {
                        lastIndex = prop.prop;
                    }
                }
            });

            objCopy[lastIndex] = this.getReversedValue(metadataList, propertyName);
        } else {
            obj[src] = this.getReversedValue(metadataList, propertyName);
        }
    }

    /**
     * Retrieves the reversed value of a property based on the provided metadata.
     * 
     * @param metadataList - An object containing metadata for properties.
     * @param propertyName - The name of the property to retrieve the reversed value for.
     * @returns The reversed value of the property. If the property is an array, it applies the reverser function or maps each item to its mapped value. If the property has a `toMap` method, it calls that method. Otherwise, it applies the reverser function or returns the property value directly.
     */
    private getReversedValue(metadataList: any, propertyName: string): any {
        if (Array.isArray(this[propertyName])) {
            return metadataList[propertyName].reverser ? metadataList[propertyName].reverser(this[propertyName], this) : this[propertyName].map(item => item?.toMap ? item.toMap() : item);
        } else if (metadataList[propertyName].toMap) {
            return this[propertyName]?.toMap();
        } else {
            return metadataList[propertyName].reverser ? metadataList[propertyName].reverser(this[propertyName], this) : this[propertyName];
        }
    }

    /**
     * Maps the properties of the given object to the current instance based on metadata.
     * 
     * @param obj - The source object whose properties are to be mapped.
     * @returns The current instance with mapped properties.
     */
    objToModel(obj: Object) {
        const metadataList: any = getMapFieldMetadataList(this);

        Object.keys(obj).forEach(propertyName => {
            if (metadataList && metadataList[propertyName]) {
                if (metadataList[propertyName].transformer) {
                    this[propertyName] = Array.isArray(obj[propertyName])
                        ? obj[propertyName].map(item => item)
                        : metadataList[propertyName].transformer(obj[propertyName], obj);
                } else {
                    this[propertyName] = obj[propertyName];
                }
            } else {
                this[propertyName] = obj[propertyName];
            }
        });

        return this;
    }

    /**
     * Checks if all properties of the current object are either `undefined` or `null`.
     *
     * @returns {boolean} `true` if all properties are `undefined` or `null`, otherwise `false`.
     */
    empty(): boolean {
        return !Object.keys(this).some(propertyName => this[propertyName] !== undefined && this[propertyName] !== null);
    }

    /**
     * Retrieves a nested property value from the object based on the provided path.
     * The path can include dot notation and array indices.
     *
     * @template T - The expected type of the property value.
     * @param {string} path - The path to the property, using dot notation and array indices.
     * @returns {T} - The value of the property at the specified path.
     */
    get<T>(path: string): T {
        const props = path.replace(/\[(\w+)\]/g, '.$1').split('.');
        return props.reduce((acc, prop) => acc && acc[prop], this) as T;
    }

    /**
     * Sets the value at the specified path within the object.
     * The path is a string that can include dot notation and array indices.
     * 
     * @param path - The path to the property to set, using dot notation and array indices.
     * @param value - The value to set at the specified path.
     */
    set(path: string, value: any) {
        const props = path.replace(/\[(\w+)\]/g, '.$1').split('.');
        let obj = this;

        let i: number;
        for (i = 0; i < props?.length - 1; i++) {
            props?.[i] && (obj = obj?.[props?.[i]]);
        }

        props?.[i] && obj && (obj[props?.[i]] = value);
    }
}

/**
 * @deprecated The method should not be used
 */
export function MapperFactoryFun(baseClass: ClassType = Object): ClassType {
    return class Mapper extends baseClass {
        /**
         * Constructor of the mapper.
         * 
         * @param object object to be mapped considering metadata "src" and "transformer"
         * @param rest other optional parameters
         */
        constructor(object?: any, ...rest: any[]) {
            super(...rest);
        }
    };
}
