import { MapInterface } from "../class.decorator";
import { MapField } from "./field.decorator";

export function ObjectField<T extends MapInterface<T>>(
  clsFactory: new () => T
): PropertyDecorator {
  const Ctor = clsFactory;

  return MapField({
    transformer: (obj: any) => (obj ? new Ctor().from(obj) : null),
    reverser: (obj: T) => obj?.toMap?.() ?? null,
  });
}
