import { getMapFieldMetadataList } from "./field.decorator"
import { ClassType } from "./types"

export function MapperFactory(baseClass: ClassType = Object) {
    class FeBeMapper extends baseClass {
        constructor(object?: any, ...rest: any[]) {
            super(...rest);

            const metadataList: any = getMapFieldMetadataList(this);

            object &&
                Object.keys(object).forEach(propertyName => {
                    let metaKey = metadataList && Object.keys(metadataList).filter(metadata => metadataList[metadata]?.src == propertyName)[0];

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
                });

        }

        toMap() {
            const metadataList: any = getMapFieldMetadataList(this);

            let obj = {};
            Object.keys(this).forEach(propertyName => {
                if (Object.keys(metadataList).includes(propertyName)) {
                    const src = metadataList[propertyName].src || propertyName

                    if (Array.isArray(this[propertyName])) {
                        obj[src] = this[propertyName].map(item => {
                            return item?.toMap ? item.toMap() : item;
                        });
                    } else if (metadataList[propertyName].toMap) {
                        obj[src] = this[propertyName]?.toMap();
                    } else {
                        obj[src] = this[propertyName];
                    }
                } else {
                    obj[propertyName] = this[propertyName];
                }
            });

            return obj;
        }

        objToModel(obj: Object) {
            const metadataList: any = getMapFieldMetadataList(this);

            Object.keys(obj).forEach(propertyName => {
                if (Object.keys(metadataList).includes(propertyName)) {
                    if (metadataList[propertyName].transformer) {
                        this[propertyName].objToModel(obj[propertyName]);
                    } else {
                        this[propertyName] = obj[propertyName];
                    }
                } else {
                    this[propertyName] = obj[propertyName];
                }
            });

            return this;
        }

        empty(): boolean {
            let check = true;
            Object.keys(this).forEach(propertyName => {
                if (this.propertyName) {
                    check = false;
                }
            });

            return check;
        }

        /**
         * 
         * @param path string
         * @returns 
         */
        get<T>(path: string) {
            let pathReplaced = path.replace(/\[(\w+)\]/g, '.$1');
            let props: string[] = pathReplaced.split('.');
            let rtn: any
            if (props.length) {
                rtn = this[props[0]];
                for (let index in props) {
                    if (+index > 0)
                        rtn = rtn && rtn[props[index]];
                }
            }
            return <T>rtn;
        }

        /**
         * 
         * @param path string
         * @param value any
         */
        set(path: string, value: any) {
            path = path.replace(/\[(\w+)\]/g, '.$1');
            let props: string[] = path.split('.');

            let obj = this;
            let i: number;
            for (i = 0; i < props.length - 1; i++)
                obj = obj[props[i]];

            obj[path[i]] = value;
        }
    }

    return FeBeMapper
}