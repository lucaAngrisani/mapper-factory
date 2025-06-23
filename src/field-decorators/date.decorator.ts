import { MapField } from "./field.decorator";

export function DateField(): PropertyDecorator {
  return MapField({
    transformer: (dateISO: string | null) =>
      dateISO ? new Date(dateISO) : null,
    reverser: (date: Date | null) => date?.toISOString() ?? null,
  });
}
