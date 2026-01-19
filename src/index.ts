import { MapClass, MapInterface } from "./class.decorator";
import { MapField } from "./field-decorators/field.decorator";
import { ArrayField } from "./field-decorators/array.decorator";
import { DateField } from "./field-decorators/date.decorator";
import { ObjectField } from "./field-decorators/object.decorator";
import { ClassType } from "./types";

export {
  ClassType,
  MapInterface,
  MapClass,
  MapField,
  DateField,
  ArrayField,
  ObjectField,
};

/**
 * npx tsc
 * npx tsx src/test.ts
 * npm version ( patch | minor | major )
 * npm publish
 */
