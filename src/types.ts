export declare type ClassType<Class = any> = { new (...args: any[]): Class };

export declare type AnyFunction<A = any> = (...input: any[]) => A;
export declare type AnyConstructor<A = Record<string, unknown>> = new (
  ...input: any[]
) => A;

export declare type Mixin<T extends AnyFunction> = InstanceType<ReturnType<T>>;
