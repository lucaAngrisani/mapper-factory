import { getMapFieldMetadataList } from "./field-decorators/field.decorator";
import { getValueByPath, setValueByPath } from "./utils";

export interface MapperTarget {
  [key: string]: any;
  from?(obj: unknown): MapperTarget;
  toMap?(): Record<string, unknown>;
}

/**
 * Convert the instance of this class to JSON Object.
 *
 * @returns JSON object mapped considering metadata "src" and "reverser"
 */
export function toMap(this: MapperTarget): Record<string, unknown> {
  const metadataList: any = getMapFieldMetadataList(this);
  const obj: Record<string, unknown> = {};

  if (this) {
    Object.keys(this).forEach((propertyName) => {
      const metadata = metadataList && metadataList[propertyName];
      const src = metadata?.src || propertyName;
      const value = this[propertyName];

      let finalValue: unknown;

      if (metadata) {
        if (Array.isArray(value) && !metadata.reverser) {
          finalValue = value.map((item) => (item?.toMap ? item.toMap() : item));
        } else if (metadata.reverser) {
          finalValue = metadata.reverser(value, this);
        } else if (value?.toMap) {
          finalValue = value.toMap();
        } else {
          finalValue = value;
        }
      } else {
        if (Array.isArray(value)) {
          finalValue = value.map((item) => (item?.toMap ? item.toMap() : item));
        } else if (value?.toMap) {
          finalValue = value.toMap();
        } else {
          finalValue = value;
        }
      }

      if (finalValue !== undefined) {
        setValueByPath(obj, src, finalValue);
      }
    });
  }

  return obj;
}

/**
 * Convert a JSON Object to an instance of this class.
 *
 * @param obj JSON Object
 * @returns Instance of this class
 */
export function objToModel(
  this: MapperTarget,
  obj: Record<string, any>,
): MapperTarget {
  if (!obj) return this;

  Object.keys(obj).forEach((propertyName) => {
    const value = obj[propertyName];

    this[propertyName] = Array.isArray(value)
      ? value.map((item: unknown) => item)
      : value;
  });

  return this;
}

/**
 * Check if this instance is empty.
 *
 * @returns true or false
 */
export function empty(this: MapperTarget): boolean {
  return !Object.keys(this).some(
    (propertyName) =>
      this[propertyName] !== undefined && this[propertyName] !== null,
  );
}

/**
 * Check if this instance is filled.
 *
 * @returns true or false
 */
export function filled(this: MapperTarget): boolean {
  return (
    Object.keys(this).length > 0 &&
    Object.keys(this).every(
      (propertyName) =>
        this[propertyName] !== undefined && this[propertyName] !== null,
    )
  );
}

/**
 * GET property value from a string path.
 *
 * @param path String path
 * @returns Value of the property
 */
export function get<T>(this: MapperTarget, path: string): T {
  return getValueByPath(this, path);
}

/**
 * SET property value from a string path.
 *
 * @param path String path
 * @param value Value of the property
 */
export function set(this: MapperTarget, path: string, value: unknown): void {
  setValueByPath(this, path, value);
}

/**
 * Deep copy of the object caller
 */
export function copy<T extends MapperTarget>(this: T): T {
  if (this.from && this.toMap) {
    return this.from(this.toMap()) as unknown as T;
  }
  return this;
}

/**
 * Constructor of the mapper.
 *
 * @param object object to be mapped considering metadata "src", "transformer" and "reverser"
 */
export function from(
  this: MapperTarget,
  object: Record<string, any>,
): MapperTarget {
  const metadataList: any = getMapFieldMetadataList(this);
  const mappedSrcRoots = new Set<string>();

  // 1. Process Metadata
  if (metadataList && object) {
    Object.keys(metadataList).forEach((key) => {
      const meta = metadataList[key];
      const src = meta.src || key;

      // Identify root property for this mapping to exclude it from direct copy later
      const normalizedPath = src.replace(/\[(\w+)\]/g, ".$1");
      const root = normalizedPath.split(".")[0];
      mappedSrcRoots.add(root);

      const value = getValueByPath(object, src);

      // Only process if value exists in source (matches old behavior and avoids infinite recursion on undefined)
      if (value !== undefined) {
        if (meta.transformer) {
          const transformed = meta.transformer(value, object);
          if (transformed !== undefined) {
            this[key] = transformed;
          }
        } else {
          this[key] = value;
        }
      }
    });
  }

  // 2. Process Remaining Properties (Direct Copy)
  // Only if they are not part of a mapped source root
  if (object) {
    Object.keys(object).forEach((prop) => {
      if (!mappedSrcRoots.has(prop)) {
        this[prop] = object[prop];
      }
    });
  }

  // 3. Initialize properties with "initialize" metadata
  if (metadataList) {
    Object.keys(metadataList).forEach((metaName) => {
      const meta = metadataList[metaName];
      if (
        meta?.initialize &&
        meta?.transformer &&
        this[metaName] === undefined
      ) {
        this[metaName] = meta.transformer(null, object);
      }
    });
  }

  return this;
}
