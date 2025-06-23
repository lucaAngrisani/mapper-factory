import { MapInterface } from "../class.decorator";
import { MapField } from "./field.decorator";

export function ArrayField<T extends MapInterface<T>>(
  clsFactory: () => new () => T
): PropertyDecorator {
  const Ctor = clsFactory();

  return MapField({
    transformer: (arr: any[]) =>
      Array.isArray(arr)
        ? arr.map((item) => new Ctor().from(item))
        : [],
    reverser: (arr: T[]) =>
      Array.isArray(arr) ? arr.map((item) => item.toMap()) : [],
  });
}
