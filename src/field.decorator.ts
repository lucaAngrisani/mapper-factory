import 'reflect-metadata';
import { ClassType } from './types';

export const MAP_FIELD = Symbol('MAP_FIELD');

export interface MapperMetadata<T = any> {
    src?: string;
    transformer?: { (input: any): any };
    reverser?: { (input: any): any };

    //   _propertyName?: string;
}

export function isClass(func: any): func is ClassType {
    return (
        typeof func === 'function' &&
        /^class\s/.test(Function.prototype.toString.call(func))
    );
}

export function getPrototype(target: Record<string, unknown> | ClassType): any {
    return isClass(target) || !target.prototype ? !target.constructor ? target : target.constructor : target.prototype;
}

export const MapField = <T = any>({
    transformer,
    reverser,
    src
}: MapperMetadata<T> = {}): PropertyDecorator => {
    return (target: any, property: string | symbol) => {
        const classConstructor = target.constructor;
        const propertyName = property.toString();

        const metadata =
            Reflect.getMetadata(MAP_FIELD, classConstructor) || {};

        // create new object reference to avoid this issue: https://github.com/rbuckton/reflect-metadata/issues/62
        const newMetadata: any = { ...metadata };

        const previousValues = metadata[propertyName];

        newMetadata[propertyName] = {
            ...previousValues,
            src,
            transformer,
            reverser,
        };

        Reflect.defineMetadata(
            MAP_FIELD,
            newMetadata,
            classConstructor,
        );
    };
};

export const getMapFieldMetadataList = (
    target: Record<string, unknown> | ClassType | any,
): { [key: string]: MapperMetadata } | undefined => {
    return Reflect.getMetadata(MAP_FIELD, getPrototype(target));
};

export const hasMapFieldMetadataList = (
    target: Record<string, unknown> | ClassType,
): boolean => {
    return Reflect.hasMetadata(MAP_FIELD, getPrototype(target));
};

export const getMapFieldMetadata = (
    target: Record<string, unknown> | ClassType,
    propertyName: string | symbol,
): MapperMetadata | undefined => {
    const metadata = getMapFieldMetadataList(target);

    const name = propertyName.toString();

    if (!metadata || !metadata[name]) return undefined;

    return metadata[name];
};

export const hasMapFieldMetadata = (
    target: Record<string, unknown> | ClassType,
    propertyName: string,
): boolean => {
    const metadata = Reflect.getMetadata(
        MAP_FIELD,
        getPrototype(target),
    );

    return metadata && !!metadata[propertyName];
};
