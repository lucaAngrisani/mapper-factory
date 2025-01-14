import { MapClass, MapInterface } from "./class.decorator";
import { MapField } from "./field.decorator";
import {
    objToModel,
    toMap,
    toModel
} from "./mapper-functions";
import { ClassType } from "./types";

export {
    ClassType, MapClass, MapField, MapInterface,
    objToModel,
    toMap,
    toModel
};

/**
 * npx tsc
 * npx ts-node src/example.ts
 * npm version ( patch | minor | major )  
 * npm publish
 */