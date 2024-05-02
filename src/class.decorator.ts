import { copy, empty, filled, from, get, objToModel, set, toMap } from "./functions";

export function MapClass() {

    return function (constructor) {
        constructor.prototype.from = from;
        constructor.prototype.toMap = toMap;
        constructor.prototype.toModel = objToModel;
        constructor.prototype.empty = empty;
        constructor.prototype.filled = filled;
        constructor.prototype.get = get;
        constructor.prototype.set = set;
        constructor.prototype.copy = copy;
    }

}

export interface MapInterface<T> {
    from: (object?: any) => T;
    toMap: () => any;
    toModel: (object: any) => T;
    empty: () => boolean;
    filled: () => boolean;
    get: (path: string) => T;
    set: (path: string, value: any) => void;
    copy: () => T;
}