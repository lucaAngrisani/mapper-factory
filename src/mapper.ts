import { getMapFieldMetadataList } from "./field.decorator"
import { ClassType } from "./types"

export class MapperFactory {
    /**
     * Constructor of the mapper.
     * 
     * @param object object to be mapped considering metadata "src" and "transformer"
     */
    constructor(object?: any) {

        const metadataList: any = getMapFieldMetadataList(this);

        object &&
            Object.keys(object).forEach(propertyName => {
                let metaKeys = metadataList && Object.keys(metadataList).filter(metadata => metadataList[metadata]?.src?.startsWith(propertyName) && metadataList[metadata]?.src != propertyName);
                if (metaKeys.length) {
                    metaKeys.forEach(metaKey => {
                        let metaProp = metadataList[metaKey];
                        if (metaProp) {
                            let props: string[] = metaProp.src?.split('.');
                            let propsStereoid = props.map(prop => {
                                let index = prop.indexOf('[');
                                return {
                                    prop: index > 0 ? prop.substring(0, index) : prop,
                                    isArray: prop.includes('[') && prop.includes(']'),
                                    arrIndex: prop.substring(index),
                                }
                            });

                            let i: number;
                            let objCopy = { ...object };
                            for (i = 0; i < propsStereoid.length; i++) {
                                if (propsStereoid[i].isArray) {
                                    let arrIndex = propsStereoid[i].arrIndex?.split(/\[(\w+)\]/g)?.filter(index => index !== '');
                                    objCopy = objCopy[propsStereoid[i].prop];

                                    arrIndex.forEach((index, i) => {
                                        objCopy = objCopy[index];
                                    });
                                } else {
                                    objCopy = objCopy[propsStereoid[i].prop];
                                }
                            }

                            if (metaProp?.transformer) {
                                this[metaKey] = metaProp.transformer(objCopy);
                            } else {
                                this[metaKey] = objCopy;
                            }
                        } else {
                            let metaKey = metadataList && Object.keys(metadataList).find(metadata => metadataList[metadata]?.src == propertyName);
                            if (metaKey) {
                                const src = metadataList[metaKey].src || propertyName;

                                if (metadataList[metaKey].transformer) {
                                    this[metaKey] = metadataList[metaKey].transformer(object[src]);
                                } else {
                                    this[metaKey] = object[src];
                                }
                            } else {
                                if (metadataList[propertyName]?.transformer) {
                                    this[propertyName] = metadataList[propertyName].transformer(object[propertyName]);
                                } else {
                                    this[propertyName] = object[propertyName];
                                }
                            }
                        }
                    });
                } else {
                    let metaKey = metadataList && Object.keys(metadataList).find(metadata => metadataList[metadata]?.src == propertyName);
                    if (metaKey) {
                        const src = metadataList[metaKey].src || propertyName;

                        if (metadataList[metaKey].transformer) {
                            this[metaKey] = metadataList[metaKey].transformer(object[src]);
                        } else {
                            this[metaKey] = object[src];
                        }
                    } else {
                        if (metadataList[propertyName]?.transformer) {
                            this[propertyName] = metadataList[propertyName].transformer(object[propertyName]);
                        } else {
                            this[propertyName] = object[propertyName];
                        }
                    }
                }
            });
    }

    /**
     * Convert the instance of this class to JSON Object.
     *  
     * @returns JSON object mapped considering metadata "src" and "reverser"
     */
    toMap(): any {
        const metadataList: any = getMapFieldMetadataList(this);

        let obj = {};
        Object.keys(this).forEach(propertyName => {
            if (Object.keys(metadataList).some(prop => prop == propertyName)) {
                const src = metadataList[propertyName].src || propertyName;

                if (src.includes('.')) {
                    let props: string[] = src.split('.');
                    let propsStereoid = props.map(prop => {
                        let index = prop.indexOf('[');
                        return {
                            prop: index > 0 ? prop.substring(0, index) : prop,
                            isArray: prop.includes('[') && prop.includes(']'),
                            arrIndex: prop.substring(index),
                        }
                    });

                    let i: number;
                    let objCopy = obj;
                    let lastIndex: string;
                    for (i = 0; i < propsStereoid?.length; i++) {
                        if (propsStereoid[i].isArray) {
                            let arrIndex = propsStereoid[i].arrIndex?.split(/\[(\w+)\]/g)?.filter(index => index !== '');
                            objCopy[propsStereoid[i].prop] = objCopy[propsStereoid[i].prop] || [];
                            objCopy = objCopy[propsStereoid[i].prop];

                            arrIndex.forEach((index, i) => {
                                objCopy[index] = objCopy[index] || (i == arrIndex.length - 1 ? {} : []);
                                if (!(i == propsStereoid.length - 1))
                                    objCopy = objCopy[index];
                                else
                                    lastIndex = index;
                            });
                        } else {
                            objCopy[propsStereoid[i].prop] = objCopy[propsStereoid[i].prop] || {};
                            if (!(i == propsStereoid?.length - 1))
                                objCopy = objCopy[propsStereoid[i].prop];
                            else
                                lastIndex = propsStereoid[i].prop;
                        }
                    }

                    if (Array.isArray(this[propertyName])) {
                        objCopy[lastIndex] = metadataList[propertyName].reverser ?
                            metadataList[propertyName].reverser(this[propertyName])
                            : this[propertyName].map(item => {
                                return item?.toMap ? item.toMap() : item;
                            });
                    } else if (metadataList[propertyName].toMap) {
                        objCopy[lastIndex] = this[propertyName]?.toMap();
                    } else {
                        objCopy[lastIndex] = metadataList[propertyName].reverser ? metadataList[propertyName].reverser(this[propertyName]) : this[propertyName];
                    }
                } else {
                    if (Array.isArray(this[propertyName])) {
                        obj[src] = this[propertyName].map(item => {
                            return item?.toMap ? item.toMap() : item;
                        });
                    } else if (metadataList[propertyName].toMap) {
                        obj[src] = this[propertyName]?.toMap();
                    } else {
                        obj[src] = metadataList[propertyName]?.reverser ? metadataList[propertyName].reverser(this[propertyName]) : this[propertyName];
                    }
                }
            } else {
                obj[propertyName] = metadataList[propertyName]?.reverser ? metadataList[propertyName].reverser(this[propertyName]) : this[propertyName];
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
    objToModel(obj: Object) {
        const metadataList: any = getMapFieldMetadataList(this);

        Object.keys(obj).forEach(propertyName => {
            if (Object.keys(metadataList).some(prop => prop == propertyName)) {
                if (metadataList[propertyName].transformer) {
                    if (Array.isArray(obj[propertyName])) {
                        this[propertyName] = obj[propertyName].map(item => {
                            return item;
                        });
                    } else {
                        this[propertyName] = obj[propertyName];
                    }
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
     * Check if this instance is empty.
     * 
     * @returns true or false
     */
    empty(): boolean {
        let check = true;
        Object.keys(this).forEach(propertyName => {
            if (this[propertyName] !== undefined && this[propertyName] !== null) {
                check = false;
            }
        });

        return check;
    }

    /**
     * GET property value from a string path.
     * 
     * @param path String path
     * @returns Value of the property
     */
    get<T>(path: string) {
        let pathReplaced = path.replace(/\[(\w+)\]/g, '.$1');
        let props: string[] = pathReplaced.split('.');
        let rtn: any
        if (props?.length) {
            rtn = this[props[0]];
            for (let index in props) {
                if (+index > 0)
                    rtn = rtn && rtn[props[index]];
            }
        }
        return <T>rtn;
    }

    /**
     * SET property value from a string path.
     * 
     * @param path String path
     * @param value Value of the property
     */
    set(path: string, value: any) {
        path = path.replace(/\[(\w+)\]/g, '.$1');
        let props: string[] = path.split('.');

        let obj = this;
        let i: number;
        for (i = 0; i < props?.length - 1; i++)
            obj = obj[props[i]];

        obj[props[i]] = value;
    }

}

/**
 * @deprecated The method should not be used
 */
export function MapperFactoryFun(baseClass: ClassType = Object): ClassType {
    class Mapper extends baseClass {
        /**
         * Constructor of the mapper.
         * 
         * @param object object to be mapped considering metadata "src" and "transformer"
         * @param rest other optional parameters
         */
        constructor(object?: any, ...rest: any[]) {
            super(...rest);
        }
    }

    return Mapper;
}
