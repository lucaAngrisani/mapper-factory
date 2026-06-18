import { MapField } from "./field.decorator";

export function DateField(opt?: {
  src?: string;
}): (target: unknown, propertyKey: string | symbol | object) => void {
  return MapField({
    src: opt?.src,
    transformer: (dateISO: string | null) =>
      dateISO ? new Date(dateISO) : null,
    reverser: (date: Date | null) => date?.toISOString() ?? null,
  }) as (target: unknown, propertyKey: string | symbol | object) => void;
}
