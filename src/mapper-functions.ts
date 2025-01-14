import { MapperFactory } from "./mapper.to-remove";

export function toMap(model: MapperFactory): Object {
    return model.toMap();
}

export function toModel<T extends MapperFactory>(obj: Object): T {
    return new MapperFactory(obj) as T;
}

export function objToModel<T extends MapperFactory>(model: MapperFactory, obj: Object): T {
    return model.objToModel(obj) as T;
}

export function copy<T extends MapperFactory>(model: MapperFactory): T {
    return new MapperFactory(model.toMap()) as T;
}
