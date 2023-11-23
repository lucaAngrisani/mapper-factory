import { constructorMap, copy, empty, filled, get, objToModel, set, toMap } from "../src/functions";

export function MapperFactory() {

    return function (constructor) {
        constructor.prototype.from = constructorMap;
        constructor.prototype.toMap = toMap;
        constructor.prototype.toModel = objToModel;
        constructor.prototype.empty = empty;
        constructor.prototype.filled = filled;
        constructor.prototype.get = get;
        constructor.prototype.set = set;
        constructor.prototype.copy = copy;
    }

}

export interface MapperInterface<T> {
    from: (object?: any) => T;
    toMap: () => any;
    toModel: (object: any) => T;
    empty: () => boolean;
    filled: () => boolean;
    get: (path: string) => T;
    set: (path: string, value: any) => void;
    copy: () => T;
}