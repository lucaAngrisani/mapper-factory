import { MapInterface } from "../class.decorator";
import { MapField } from "./field.decorator";

export function ArrayField<T extends MapInterface<T>>(
  clsFactory: new () => T,
  opt?: { src?: string },
): (target: unknown, propertyKey: string | symbol | object) => void {
  const Ctor = clsFactory;

  return MapField({
    src: opt?.src,
    transformer: (arr: any[]) =>
      Array.isArray(arr) ? arr.map((item) => new Ctor().from(item)) : [],
    reverser: (arr: T[]) =>
      Array.isArray(arr) ? arr.map((item) => item.toMap()) : [],
  }) as (target: unknown, propertyKey: string | symbol | object) => void;
}
